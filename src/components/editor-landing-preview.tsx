
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
}

interface EditorLandingPreviewProps {
  data: LandingPageData;
}

export function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  
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
                        <Image src={subsection.imageUrl} alt={subsection.title} layout="fill" objectFit="cover" />
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
      </div>
    </div>
  );
}

