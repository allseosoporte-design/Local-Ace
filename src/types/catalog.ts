
export interface SocialLinks {
    tiktok: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
    twitter: string;
    youtube: string;
}

export interface CarouselItemData {
    imageUrl: string;
    slogan: string;
    imageHint: string;
}

export interface CatalogHeaderConfigData {
  bannerUrl: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: SocialLinks;
  carouselItems?: CarouselItemData[];
  customSlug?: string;
  isCustomSlugEnabled?: boolean;
}
