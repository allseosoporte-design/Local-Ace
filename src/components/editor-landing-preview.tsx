
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function EditorLandingPreview() {
  const heroImage = "https://picsum.photos/seed/websapmax/1200/800";

  return (
    <div className="w-full h-full scale-[0.9] origin-top transform transition-transform p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Vista Previa en Tiempo Real</h3>
      <div className="rounded-lg border bg-background shadow-md">
        {/* Hero Section */}
        <section className="text-center p-8 md:p-12 space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Moderniza tu negocio y aumenta tus ventas.
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            La herramienta definitiva para potenciar tu negocio gastronómico.
          </p>
          <div className="relative aspect-video max-w-4xl mx-auto">
            <Image
              src={heroImage}
              alt="WebSapMax Hero Image"
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="p-8 md:p-12 bg-muted/50">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Características Principales</h2>
                <p className="text-muted-foreground">Todo lo que necesitas para digitalizar tu negocio</p>
            </div>
             <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                    <h3 className="font-semibold mb-2">Gestión de Clientes</h3>
                    <p className="text-sm text-muted-foreground">
                        Ofrece a tus clientes menús interactivos que los computen desde el primer vistazo y gestiona tus pedidos sin errores.
                    </p>
                </div>
                 <div className="text-center">
                    <h3 className="font-semibold mb-2">Sistema Ágil</h3>
                    <p className="text-sm text-muted-foreground">
                       Con un sistema ágil y moderno, podrás optimizar tu servicio, reducir equivocaciones y elevar la satisfacción de tus comensales.
                    </p>
                </div>
                 <div className="text-center">
                    <h3 className="font-semibold mb-2">Tecnología Web-App</h3>
                    <p className="text-sm text-muted-foreground">
                        La tecnología está aquí para llevar tu éxito culinario al siguiente nivel y ayudarte a impulsar tus ventas como nunca antes.
                    </p>
                </div>
            </div>
        </section>

         {/* Call to Action Section */}
        <section className="p-8 md:p-12 text-center">
            <Button>Comenzar</Button>
        </section>
      </div>
    </div>
  );
}
