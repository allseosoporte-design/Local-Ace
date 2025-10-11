export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  order: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: any;
  updatedAt: any;
};
