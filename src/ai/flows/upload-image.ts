'use server';
/**
 * @fileOverview Flow para la carga segura de imágenes a Cloudinary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v2 as cloudinary, type ConfigOptions } from 'cloudinary';
import * as admin from 'firebase-admin';

/**
 * Inicialización segura de Firebase Admin SDK.
 * Se asume que serviceAccountKey.json existe en la raíz.
 */
const initializeAdmin = () => {
  if (admin.apps.length === 0) {
    try {
      // Intentamos importar de forma dinámica para evitar problemas de bundling
      const serviceAccount = require('../../../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.warn('Firebase Admin no se pudo inicializar con serviceAccountKey.json. Usando credenciales por defecto.');
      admin.initializeApp();
    }
  }
  return admin.firestore();
};

/**
 * Recupera la configuración de Cloudinary.
 * Primero intenta desde process.env, luego desde Firestore.
 */
const getCloudinaryConfig = async (): Promise<ConfigOptions> => {
  // 1. Intentar desde variables de entorno
  let config: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };

  // 2. Si faltan variables de entorno, intentar desde Firestore (adminConfig/global)
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('Variables de entorno de Cloudinary faltantes. Intentando recuperar desde Firestore...');
    const db = initializeAdmin();
    try {
      const docSnap = await db.collection('adminConfig').doc('global').get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data) {
          config = {
            cloud_name: data.cloudinaryCloudName || config.cloud_name,
            api_key: data.cloudinaryApiKey || config.api_key,
            api_secret: data.cloudinaryApiSecret || config.api_secret,
            secure: true,
          };
        }
      }
    } catch (e) {
      console.error('Error al intentar recuperar configuración desde Firestore:', e);
    }
  }

  // 3. Validación final
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error(
      'Configuración de Cloudinary incompleta. Por favor, asegúrese de configurar las credenciales en el Panel de Administrador -> Configuración.'
    );
  }

  return config;
};

const UploadImageInputSchema = z.object({
  fileAsDataUrl: z
    .string()
    .describe(
      "Imagen codificada en data URI (base64). Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  folder: z.string().optional().describe('Carpeta de destino opcional en Cloudinary.'),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('URL segura de la imagen cargada.'),
  publicId: z.string().describe('ID público de la imagen en Cloudinary.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

export async function uploadImage(input: UploadImageInput): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async (input) => {
    try {
      const config = await getCloudinaryConfig();
      cloudinary.config(config);

      const result = await cloudinary.uploader.upload(input.fileAsDataUrl, {
        folder: input.folder || 'local-leap-uploads',
        resource_type: 'auto',
      });

      if (!result.secure_url) {
        throw new Error('La respuesta de Cloudinary no contiene una URL segura (secure_url).');
      }

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocurrió un error inesperado durante la carga a Cloudinary.';
      
      console.error('[Cloudinary Upload Error]:', errorMessage);
      throw new Error(`Fallo en el servicio de carga: ${errorMessage}`);
    }
  }
);
