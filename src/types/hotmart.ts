import { Timestamp } from "firebase/firestore";

export interface HotmartConfig {
  hottokSecret: string;
  productId: string;
  updatedAt?: Timestamp;
}

export interface HotmartPlanMapping {
  id: string;
  offerId: string;
  offerName: string;
  internalPlanId: string;
  hotlinkUrl: string; // Link de divulgación (HotLink)
  active: boolean;
  createdAt?: Timestamp;
}

export interface HotmartEventLog {
  id: string;
  email: string;
  event: string;
  productId: string;
  offerId: string;
  status: string;
  eventDate: Timestamp;
  processed: boolean;
  processedDate?: Timestamp;
  rawPayload?: any;
  errorMessage?: string;
}

export type HotmartEvent = 
  | 'PURCHASE_COMPLETE' 
  | 'PURCHASE_CANCELED' 
  | 'PURCHASE_REFUNDED' 
  | 'SUBSCRIPTION_CANCELLATION';
