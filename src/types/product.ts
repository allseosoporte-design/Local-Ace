import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrls: string[]; // Changed from imageUrl to imageUrls
  rating?: number; // Customer rating (e.g., 1 to 5)
  ratingCount?: number; // Number of ratings
  businessId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
