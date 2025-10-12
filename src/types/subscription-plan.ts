import { Timestamp } from "firebase/firestore";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'COP' | 'USD';
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  order: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
