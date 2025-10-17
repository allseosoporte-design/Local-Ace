"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Catálogo de Productos</h1>
          <p className="text-muted-foreground">
            Gestiona los productos de tu tienda.
          </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tus Productos</CardTitle>
          <CardDescription>
            Aquí aparecerá la lista de tus productos.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Aún no hay productos en tu catálogo.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
