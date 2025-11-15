import { Timestamp } from "firebase/firestore";

export interface AutomatedPost {
    id: string;
    businessId: string;
    googleMyBusinessProfileId: string;
    content: string;
    scheduledDate: Timestamp;
    status: 'Published' | 'Scheduled' | 'Draft';
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  }
