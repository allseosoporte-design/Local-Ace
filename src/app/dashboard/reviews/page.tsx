"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2 } from "lucide-react";
import { recentReviewsData, internalFeedbackData } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns, feedbackColumns } from "./columns";

export default function ReviewsPage() {
  const businessId = "your-business-123";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Reseñas</h1>
          <p className="text-muted-foreground">
            Gestiona tu reputación online e interactúa con los clientes.
          </p>
        </div>
        <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/funnel/${businessId}`)}>
          <Share2 className="mr-2 h-4 w-4" />
          Copiar Enlace del Embudo
        </Button>
      </div>

      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public">Reseñas Públicas</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Interno</TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de 5 Estrellas</CardTitle>
              <CardDescription>
                Reseñas de clientes que te calificaron con 5 estrellas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={recentReviewsData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Interno</CardTitle>
              <CardDescription>
                Comentarios de clientes que te calificaron con 1-4 estrellas. Esto no es público.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={feedbackColumns} data={internalFeedbackData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
