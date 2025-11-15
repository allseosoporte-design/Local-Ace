
export interface GoogleMyBusinessProfile {
    id: string;
    businessId: string;
    businessName?: string;
    businessDescription?: string;
    address?: string;
    primaryCategory: string;
    additionalCategories?: string[];
    profileUrl: string;
    keywords?: string[];
}
