
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ChatbotNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Notificaciones del Chatbot
        </h1>
        <p className="text-muted-foreground">
          Revisa las interacciones importantes y alertas de tu chatbot.
        </p>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Bell className="h-16 w-16 mb-4" />
            <p>Aquí verás las notificaciones generadas por el chatbot.</p>
        </CardContent>
      </Card>
    </div>
  );
}
