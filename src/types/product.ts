
import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrls: string[]; // Changed from imageUrl to imageUrls
  businessId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
