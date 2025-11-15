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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { PlusCircle, Info, CheckCircle, AlertTriangle, MoreHorizontal } from "lucide-react";
import { postsData } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.654-11.077-8.591l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.636,44,30.833,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
)

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
      
      {/* New GMB Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Google My Business</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Info className="h-4 w-4" /> Conecta y gestiona para publicar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white">
              <GoogleIcon />
              <span className="ml-2">Conectar Nueva Cuenta de Google</span>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cuentas Conectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://avatar.vercel.sh/negisio.png" />
                    <AvatarFallback>MN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Mi Negocio, S.L.</p>
                    <p className="text-sm text-muted-foreground">correo@empresa.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 mr-1"/>
                        Activa
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
              </li>
               <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://avatar.vercel.sh/centro.png" />
                    <AvatarFallback>CE</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Café El Centro</p>
                    <p className="text-sm text-muted-foreground">cafe.centro@email.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 mr-1"/>
                        Requiere atención
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
              </li>
               <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://avatar.vercel.sh/cafe.png" />
                    <AvatarFallback>CE</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Café El Centro</p>
                    <p className="text-sm text-muted-foreground">cafe.centro@email.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                        Reconectar
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
