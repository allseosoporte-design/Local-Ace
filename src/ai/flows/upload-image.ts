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
    // Intentar cargar desde el archivo de la raíz (ruta relativa al tiempo de ejecución)
    const serviceAccount = require('../../../serviceAccountKey.json');
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.warn('[Firebase Admin]: No se encontró serviceAccountKey.json, intentando inicialización por defecto.');
    return initializeApp();
  }
}

/**
 * Recupera la configuración de Cloudinary desde el entorno o la base de datos.
 */
const getCloudinaryConfig = async (): Promise<ConfigOptions> => {
  // 1. Intentar desde variables de entorno (Prioridad alta)
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };
  }

  // 2. Intentar desde Firestore (Configuración dinámica)
  console.log('[Cloudinary]: Buscando configuración persistente en Firestore...');
  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    // IMPORTANTE: La ruta debe coincidir con la guardada en el panel de admin
    const docRef = db.collection('adminConfig').doc('global');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.cloudinaryCloudName && data?.cloudinaryApiKey && data?.cloudinaryApiSecret) {
        return {
          cloud_name: data.cloudinaryCloudName,
          api_key: data.cloudinaryApiKey,
          api_secret: data.cloudinaryApiSecret,
          secure: true,
        };
      } else {
        console.warn('[Cloudinary]: Documento adminConfig/global existe pero faltan campos de Cloudinary.');
      }
    } else {
      console.warn('[Cloudinary]: No existe el documento adminConfig/global en Firestore.');
    }
  } catch (e) {
    console.error('[Cloudinary]: Error crítico leyendo configuración de Firestore:', e);
  }

  throw new Error(
    'Configuración de Cloudinary no encontrada. Por favor, configure las credenciales en el Panel de Administrador -> Configuración.'
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

      // Validar que la cadena base64 no sea demasiado grande para un flow (limite aprox 10MB)
      if (input.fileAsDataUrl.length > 10 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. El límite es de 10MB.');
      }

      const result = await cloudinary.uploader.upload(input.fileAsDataUrl, {
        folder: input.folder || 'local-leap-uploads',
        resource_type: 'auto',
      });

      if (!result.secure_url) {
        throw new Error('Cloudinary no devolvió una URL segura.');
      }

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocurrió un error inesperado durante el proceso de carga.';
      
      console.error('[Upload Flow Error]:', errorMessage);
      throw new Error(`Error en el servicio de imágenes: ${errorMessage}`);
    }
  }
);
