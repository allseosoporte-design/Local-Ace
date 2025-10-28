
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatbotConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Configuración de Chatbot
        </h1>
        <p className="text-muted-foreground">
          Define el comportamiento, apariencia y respuestas de tu chatbot.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p>Aquí podrás configurar tu asistente virtual.</p>
        </CardContent>
      </Card>
    </div>
  );
}
