
'use client';

import Image from 'next/image';
import {
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
} from 'lucide-react';
import type { CatalogHeaderConfigData, CarouselItemData } from '@/types/catalog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useDoc, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const socialIconMap = {
  tiktok: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71v-2.3c.94.39 1.96.61 2.99.62.67.01 1.34-.09 1.98-.28 1.3-.38 2.44-.95 3.39-1.76.49-.42.92-.91 1.29-1.47.01-1.54.01-3.08.01-4.63h-4.69v-4.03h4.69c.01-1.13.02-2.26.01-3.39z"></path></svg>
  ),
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
};

const defaultCarouselItems: CarouselItemData[] = [
    {
      imageUrl: 'https://picsum.photos/seed/tech1/1200/400',
      slogan: 'Ofertas exclusivas',
      imageHint: 'gadgets technology'
    },
    {
      imageUrl: 'https://picsum.photos/seed/tech2/1200/400',
      slogan: 'Potencia tu productividad',
      imageHint: 'modern office'
    },
    {
      imageUrl: 'https://picsum.photos/seed/tech3/1200/400',
      slogan: 'Equipos de última generación',
      imageHint: 'computer hardware'
    }
  ];

export const CatalogHeader = ({ businessId }: { businessId: string }) => {
  const firestore = useFirestore();

  const headerConfigRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/catalogConfig/header`);
  }, [firestore, businessId]);

  const { data: config, isLoading } = useDoc<CatalogHeaderConfigData>(headerConfigRef);

  if (isLoading) {
      return (
          <header className="relative animate-pulse">
              <Skeleton className="h-48 md:h-64 w-full bg-muted" />
              <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
                  <Skeleton className="h-32 w-full bg-card shadow-lg" />
              </div>
              <div className="container mx-auto px-4 mt-8">
                  <Skeleton className="h-40 md:h-56 w-full bg-muted" />
              </div>
          </header>
      );
  }

  if (!config) {
      return null; // O un header por defecto si no hay configuración
  }

  const carouselItems = (config.carouselItems && config.carouselItems.length > 0) ? config.carouselItems : defaultCarouselItems;

  return (
    <header className="relative">
      <div className="relative h-48 md:h-64 bg-gray-200">
        {config.bannerUrl && (
          <Image
            src={config.bannerUrl}
            alt="Banner del catálogo"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
        <div className="bg-background rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{config.businessName}</h1>
            <p className="text-muted-foreground">{config.address}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              {config.phone && <span>📞 {config.phone}</span>}
              {config.email && <span>📧 {config.email}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(config.socialLinks).map(([key, value]) => {
              if (value) {
                const url = key === 'whatsapp' ? `https://wa.me/${value}` : value;
                return (
                  <a href={url} key={key} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-muted transition-colors">
                    {socialIconMap[key as keyof typeof socialIconMap]}
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className="relative h-40 md:h-56 rounded-lg overflow-hidden">
                  <Image src={item.imageUrl} alt={item.slogan || `Carousel image ${index + 1}`} fill className="object-cover" data-ai-hint={item.imageHint} />
                  {item.slogan && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{item.slogan}</h2>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
      </div>
    </header>
  );
};
