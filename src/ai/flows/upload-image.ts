'use server';
/**
 * @fileOverview Flow para la carga segura de imágenes a Cloudinary.
 * 
 * - uploadImage: Función principal para invocar el proceso de carga.
 * - UploadImageInput: Interfaz de entrada (Data URL y carpeta opcional).
 * - UploadImageOutput: Interfaz de salida (URL segura e ID público).
 * 
 * Este flow maneja la configuración dinámica de Cloudinary para asegurar que
 * las credenciales se lean correctamente en el entorno de servidor de Next.js.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v2 as cloudinary, type ConfigOptions } from 'cloudinary';

/**
 * Valida y retorna las credenciales de Cloudinary desde las variables de entorno.
 * Next.js carga automáticamente el archivo .env en process.env.
 */
const getCloudinaryConfig = (): ConfigOptions => {
  const config: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error(
      'Configuración de Cloudinary incompleta. Por favor, asegúrese de que CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET estén definidos en su entorno o archivo .env.'
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

/**
 * Función exportada para ser llamada desde Server Actions o componentes de cliente.
 */
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
      // Aplicar configuración dinámicamente en cada ejecución para asegurar consistencia
      cloudinary.config(getCloudinaryConfig());

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
      // Gestión estricta de errores para producción
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocurrió un error inesperado durante la carga a Cloudinary.';
      
      console.error('[Cloudinary Upload Error]:', errorMessage);
      
      throw new Error(`Fallo en el servicio de carga: ${errorMessage}`);
    }
  }
);
