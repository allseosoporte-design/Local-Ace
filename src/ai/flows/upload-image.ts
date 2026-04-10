
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
 * Inicializa la aplicación de administración de Firebase de forma segura.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  try {
    const serviceAccount = require('../../../serviceAccountKey.json');
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    return initializeApp();
  }
}

/**
 * Recupera la configuración de Cloudinary con diagnóstico detallado.
 */
const getCloudinaryConfig = async (): Promise<ConfigOptions> => {
  // 1. Intentar desde variables de entorno
  const envCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const envKey = process.env.CLOUDINARY_API_KEY;
  const envSecret = process.env.CLOUDINARY_API_SECRET;

  if (envCloud && envKey && envSecret) {
    console.log('[Cloudinary]: Usando credenciales de .env');
    return {
      cloud_name: envCloud,
      api_key: envKey,
      api_secret: envSecret,
      secure: true,
    };
  }

  // 2. Intentar desde Firestore
  console.log('[Cloudinary]: Buscando configuración en Firestore (adminConfig/global)...');
  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const docRef = db.collection('adminConfig').doc('global');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      const dbCloud = data?.cloudinaryCloudName;
      const dbKey = data?.cloudinaryApiKey;
      const dbSecret = data?.cloudinaryApiSecret;

      if (dbCloud && dbKey && dbSecret) {
        return {
          cloud_name: dbCloud,
          api_key: dbKey,
          api_secret: dbSecret,
          secure: true,
        };
      }
      
      // Diagnóstico de campos faltantes
      const missing = [];
      if (!dbCloud) missing.push('Cloud Name');
      if (!dbKey) missing.push('API Key');
      if (!dbSecret) missing.push('API Secret');
      
      throw new Error(`Faltan campos en Firestore: ${missing.join(', ')}`);
    }
  } catch (e: any) {
    console.error('[Cloudinary]: Error leyendo Firestore:', e.message);
  }

  throw new Error(
    'Configuración de Cloudinary incompleta. Por favor, configure su "Cloud Name" en el Panel de Administrador -> Configuración.'
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

      if (input.fileAsDataUrl.length > 10 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. El límite es de 10MB.');
      }

      console.log(`[Cloudinary]: Subiendo a la nube "${config.cloud_name}"...`);
      const result = await cloudinary.uploader.upload(input.fileAsDataUrl, {
        folder: input.folder || 'local-leap-uploads',
        resource_type: 'auto',
      });

      if (!result.secure_url) {
        throw new Error('Cloudinary no devolvió una URL válida.');
      }

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado en la carga.';
      
      console.error('[Upload Flow Error]:', errorMessage);
      throw new Error(`Fallo en el servicio de carga: ${errorMessage}`);
    }
  }
);
