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

// Configure Cloudinary with credentials from environment variables for security.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      const uploadResult = await cloudinary.uploader.upload(input.fileAsDataUrl, {
        folder: input.folder || 'local-leap-uploads',
      });

      if (!uploadResult.secure_url) {
        throw new Error('Cloudinary upload failed: No secure_url returned.');
      }

      return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error: any) {
      console.error('Error uploading image to Cloudinary:', error);
      // Throw a structured error that can be handled by the client.
      throw new Error(`Failed to upload image. Reason: ${error.message}`);
    }
  }
);
