
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface LandingPageData {
  title: string;
  subtitle: string;
  content: string;
  heroImageUrl: string;
  ctaText: string;
  ctaUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}

interface EditorLandingPreviewProps {
  data: LandingPageData;
}

export function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  
  // Basic function to convert newline characters to <br> tags for display
  const formatContent = (text: string) => {
    return text.split('\n').map((str, index, array) => (
      <span key={index}>
        {str}
        {index < array.length - 1 && <br />}
      </span>
    ));
  };
  
  return (
    <div
      className="w-full h-full scale-[0.95] origin-top transform transition-transform p-2"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">
        Vista Previa en Tiempo Real
      </h3>
      <div
        className="rounded-lg border bg-background shadow-md overflow-hidden"
        style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
      >
        {/* Hero Section */}
        <section className="text-center p-8 md:p-12 space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" style={{ color: data.textColor }}>
            {data.title}
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl" style={{ color: data.textColor, opacity: 0.8 }}>
            {data.subtitle}
          </p>
        </section>

        {/* Content Section */}
        <section className="px-8 md:px-12 pb-8">
            <div className="mx-auto max-w-[900px] text-left space-y-4 text-sm" style={{ color: data.textColor, opacity: 0.9 }}>
                {formatContent(data.content)}
            </div>
             {data.heroImageUrl && (
                <div className="relative aspect-video max-w-4xl mx-auto mt-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={data.heroImageUrl}
                    alt="Hero Image"
                    fill
                    className="object-cover"
                />
                </div>
            )}
        </section>

        {/* Call to Action Section */}
        <section className="p-8 md:p-12 text-center">
          <Link href={data.ctaUrl}>
            <Button
              size="lg"
              style={{
                backgroundColor: data.buttonColor,
                color: '#FFFFFF' // Assuming white text for colored buttons
              }}
              className="shadow-md hover:opacity-90 transition-opacity"
            >
              {data.ctaText}
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
