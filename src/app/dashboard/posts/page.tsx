import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { PlusCircle } from "lucide-react";
import { postsData } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Publicaciones Automatizadas</h1>
          <p className="text-muted-foreground">
            Programa y publica contenido para mantener tu perfil activo.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Publicación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear una nueva publicación</DialogTitle>
              <DialogDescription>
                Escribe tu contenido, añade una imagen y prográmala para más tarde.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Contenido de la Publicación</Label>
                        <Textarea id="post-content" placeholder="¿Qué hay de nuevo?" className="min-h-[150px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="picture">Imagen</Label>
                        <Input id="picture" type="file" />
                    </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                    <Label>Fecha de Programación</Label>
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" variant="secondary">Guardar Borrador</Button>
                <Button type="submit">Programar Publicación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tus Publicaciones</CardTitle>
          <CardDescription>
            Gestiona tus publicaciones programadas, borradores y publicadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={postsData} />
        </CardContent>
      </Card>
    </div>
  );
}
