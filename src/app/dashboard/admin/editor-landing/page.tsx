
'use client';

import { useState } from "react";
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview, type LandingPageData } from "@/components/editor-landing-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorSections } from "@/components/editor-sections";

export default function EditorLandingPage() {
  const [data, setData] = useState<LandingPageData>({
    title: "Moderniza tu negocio y aumenta tus ventas.",
    subtitle: "La herramienta definitiva para potenciar tu negocio gastronómico.",
    content: `Descubre la revolución para tu NEGOCIO. ¿Tienes una cafetería, pizzería, food truck, panadería, pastelería, servicio de catering o cualquier otro negocio gastronómico? ¡Esta solución es para ti!

Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción.

Además, nuestro sistema de gestión integral te permite controlar cada aspecto de tu negocio: desde el inventario y los pedidos hasta las mesas y el personal, todo en una sola plataforma.

Optimiza tu operación, reduce costos y toma decisiones más inteligentes con datos en tiempo real. Es la solución completa para llevar tu restaurante a un nuevo nivel de eficiencia y rentabilidad.`,
    heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
    ctaText: "Comenzar",
    ctaUrl: "/register",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    buttonColor: "#FF4500",
    sections: [],
  });

  return (
    <div className="container mx-auto p-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Editor Landing</h1>
        <p className="text-muted-foreground">
          Edita la configuración de la página principal
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
            <Tabs defaultValue="hero">
                <TabsList>
                    <TabsTrigger value="hero">Hero</TabsTrigger>
                    <TabsTrigger value="sections">Secciones</TabsTrigger>
                    <TabsTrigger value="testimonials" disabled>Testimonios</TabsTrigger>
                    <TabsTrigger value="seo" disabled>SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="hero">
                    <EditorLandingForm data={data} setData={setData} />
                </TabsContent>
                <TabsContent value="sections">
                    <EditorSections data={data} setData={setData} />
                </TabsContent>
            </Tabs>
        </div>
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-y-auto">
          <EditorLandingPreview data={data} />
        </div>
      </div>
    </div>
  );
}
