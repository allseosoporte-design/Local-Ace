'use server';
/**
 * @fileOverview Flow para la carga segura de imágenes a Cloudinary.
 * Recupera la configuración dinámicamente de Firestore si no existe en .env.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v2 as cloudinary, type ConfigOptions } from 'cloudinary';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Obtiene la instancia de Firestore de Admin de forma segura.
 * Evita el error 'INTERNAL' al usar importaciones modulares.
 */
function getAdminDb() {
  let app: App;
  const apps = getApps();
  if (apps.length === 0) {
    try {
      const serviceAccount = require('../../../serviceAccountKey.json');
      app = initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (e) {
      console.warn('[Firebase Admin]: Falló carga de serviceAccountKey.json, usando defaults.');
      app = initializeApp();
    }
  } else {
    app = apps[0];
  }
  return getFirestore(app);
}

/**
 * Recupera la configuración de Cloudinary.
 * Primero intenta desde process.env, luego desde Firestore adminConfig/global.
 */
const getCloudinaryConfig = async (): Promise<ConfigOptions> => {
  // 1. Intentar desde variables de entorno
  const envConfig: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };

  if (envConfig.cloud_name && envConfig.api_key && envConfig.api_secret) {
    return envConfig;
  }

  // 2. Intentar desde Firestore (Configuración persistente en BD)
  console.log('[Cloudinary]: Buscando configuración en Firestore...');
  try {
    const db = getAdminDb();
    const docSnap = await db.collection('adminConfig').doc('global').get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.cloudinaryCloudName && data?.cloudinaryApiKey && data?.cloudinaryApiSecret) {
        return {
          cloud_name: data.cloudinaryCloudName,
          api_key: data.cloudinaryApiKey,
          api_secret: data.cloudinaryApiSecret,
          secure: true,
        };
      }
    }
  } catch (e) {
    console.error('[Cloudinary]: Error leyendo config de Firestore:', e);
  }

  throw new Error(
    'Configuración de Cloudinary incompleta. Por favor, asegúrese de configurar las credenciales en el Panel de Administrador -> Configuración.'
  );
};

const UploadImageInputSchema = z.object({
  fileAsDataUrl: z
    .string()
    .describe(
      "Imagen codificada en data URI (base64). Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  folder: z.string().optional().describe('Carpeta de destino opcional en Cloudinary.'),
});

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('URL segura de la imagen cargada.'),
  publicId: z.string().describe('ID público de la imagen en Cloudinary.'),
});

export async function uploadImage(input: z.infer<typeof UploadImageInputSchema>): Promise<z.infer<typeof UploadImageOutputSchema>> {
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
        throw new Error('La respuesta de Cloudinary no contiene una URL segura.');
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
