
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/app/funnel/[businessId]/star-rating';
import { useState } from 'react';

export interface Subsection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  sectionColor: string;
  subsections: Subsection[];
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  avatarUrl: string;
  rating: number;
}

export interface SeoData {
  title: string;
  description: string;
  keywords: string[];
}

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
  sections: Section[];
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: Testimonial[];
  seo: SeoData;
}

interface EditorLandingPreviewProps {
  data: LandingPageData;
  formConfig?: FormConfigData;
}

export function EditorLandingPreview({ data, formConfig }: EditorLandingPreviewProps) {
  const [previewRating, setPreviewRating] = useState(0);

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

        {data.sections.map((section) => (
          <section key={section.id} style={{ backgroundColor: section.backgroundColor, color: section.textColor, borderTop: `4px solid ${section.sectionColor}` }} className="py-12 px-6">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-2" style={{color: section.textColor}}>{section.title}</h2>
              <p className="text-xl text-center text-muted-foreground mb-8" style={{color: section.textColor, opacity: 0.8}}>{section.subtitle}</p>
              <div className="text-center mb-12" style={{color: section.textColor, opacity: 0.9}}>
                {formatContent(section.content)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.subsections.map((subsection) => (
                  <div key={subsection.id} className="bg-card/80 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                    {subsection.imageUrl && (
                      <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden">
                        <Image src={subsection.imageUrl} alt={subsection.title} fill objectFit="cover" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-2" style={{color: section.textColor}}>{subsection.title}</h3>
                    <p className="text-sm" style={{color: section.textColor, opacity: 0.9}}>{formatContent(subsection.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {data.testimonials && data.testimonials.length > 0 && (
          <section className="py-12 px-6 bg-muted/30">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-2">{data.testimonialsTitle}</h2>
              <p className="text-xl text-muted-foreground mb-12">{data.testimonialsSubtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-card p-6 rounded-lg shadow-md text-left flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                        <Image src={testimonial.avatarUrl} alt={testimonial.authorName} fill objectFit="cover" />
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.authorName}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.authorRole}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic mb-4 flex-grow">"{formatContent(testimonial.text)}"</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-5 w-5", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}


        {/* Call to Action Section */}
        <section className="p-8 md:p-12 text-center">
          <Link href={data.ctaUrl}>
            <Button
              size="lg"
              style={{
                backgroundColor: data.buttonColor,
                color: '#FFFFFF'
              }}
              className="shadow-md hover:opacity-90 transition-opacity"
            >
              {data.ctaText}
            </Button>
          </Link>
        </section>

        {formConfig && (
            <section className="p-8 md:p-12 bg-muted/30">
                <h3 className="text-lg font-semibold text-center mb-4 text-foreground/80">Vista Previa del Formulario</h3>
                 <Card className="w-full max-w-md mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl font-bold">{formConfig.formTitle}</CardTitle>
                        <CardDescription>{formConfig.formSubtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className='flex justify-center'>
                       <StarRating rating={previewRating} onRating={setPreviewRating} />
                    </CardContent>
                </Card>
            </section>
        )}
      </div>
    </div>
  );
}
