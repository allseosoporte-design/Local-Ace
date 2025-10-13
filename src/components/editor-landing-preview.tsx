
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
      className="w-full h-full scale-[0.9] origin-top transform transition-transform p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">
        Vista Previa en Tiempo Real
      </h3>
      <div
        className="rounded-lg border bg-background shadow-md overflow-hidden"
        style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
      >
        {/* Hero Section */}
        <section className="text-center p-8 md:p-12 space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" style={{ color: data.textColor }}>
            {data.title}
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl" style={{ color: data.textColor, opacity: 0.8 }}>
            {data.subtitle}
          </p>
           {data.heroImageUrl && (
            <div className="relative aspect-video max-w-4xl mx-auto mt-6">
              <Image
                src={data.heroImageUrl}
                alt="Hero Image"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div className="mx-auto max-w-[700px] text-left mt-6 space-y-4 text-sm" style={{ color: data.textColor }}>
            {formatContent(data.content)}
          </div>
        </section>

        {/* Features Section - Static Example */}
        <section className="p-8 md:p-12" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: data.textColor }}>
                Características Principales
            </h2>
            <p className="text-muted-foreground" style={{ color: data.textColor, opacity: 0.7 }}>
              Todo lo que necesitas para digitalizar tu negocio
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-semibold mb-2" style={{ color: data.textColor }}>Gestión de Clientes</h3>
              <p className="text-sm text-muted-foreground" style={{ color: data.textColor, opacity: 0.7 }}>
                Ofrece a tus clientes menús interactivos que los computen desde
                el primer vistazo y gestiona tus pedidos sin errores.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2" style={{ color: data.textColor }}>Sistema Ágil</h3>
              <p className="text-sm text-muted-foreground" style={{ color: data.textColor, opacity: 0.7 }}>
                Con un sistema ágil y moderno, podrás optimizar tu servicio,
                reducir equivocaciones y elevar la satisfacción de tus
                comensales.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2" style={{ color: data.textColor }}>Tecnología Web-App</h3>
              <p className="text-sm text-muted-foreground" style={{ color: data.textColor, opacity: 0.7 }}>
                La tecnología está aquí para llevar tu éxito culinario al
                siguiente nivel y ayudarte a impulsar tus ventas como nunca
                antes.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="p-8 md:p-12 text-center">
          <Link href={data.ctaUrl}>
            <Button
              style={{
                backgroundColor: data.buttonColor,
                color: 'white' // Assuming white text for colored buttons
              }}
            >
              {data.ctaText}
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
