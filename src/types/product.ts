
import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  businessId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
