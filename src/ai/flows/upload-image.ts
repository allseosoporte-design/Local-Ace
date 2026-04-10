'use server';
/**
 * @fileOverview A flow to handle secure image uploads to Cloudinary.
 *
 * - uploadImage - A function that securely uploads an image file to Cloudinary.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The return type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

/**
 * Interface representing the required Cloudinary credentials.
 */
interface CloudinaryCredentials {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

/**
 * Validates that Cloudinary environment variables are present and returns them.
 * Throws a descriptive error if any credential is missing.
 */
function getValidatedConfig(): CloudinaryCredentials {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary configuration is incomplete. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are defined in your .env file.'
    );
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
}

const UploadImageInputSchema = z.object({
  fileAsDataUrl: z
    .string()
    .describe(
      "The image file encoded as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  folder: z.string().optional().describe('An optional folder name in Cloudinary to store the image.'),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('The secure URL of the uploaded image.'),
  publicId: z.string().describe('The public ID of the image in Cloudinary.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

/**
 * Public function to invoke the upload image flow.
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
      // Validate and apply configuration within the execution context
      const credentials = getValidatedConfig();
      cloudinary.config(credentials);

      const uploadResult = await cloudinary.uploader.upload(input.fileAsDataUrl, {
        folder: input.folder || 'local-leap-uploads',
      });

      if (!uploadResult.secure_url) {
        throw new Error('Cloudinary upload failed: No secure_url was returned from the server.');
      }

      return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during the image upload process.';
      console.error('[Cloudinary Upload Error]:', errorMessage);
      
      // Throw a clean error message for the UI/caller
      throw new Error(`Failed to upload image. Reason: ${errorMessage}`);
    }
  }
);
