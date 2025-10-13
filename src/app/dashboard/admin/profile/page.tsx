
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Perfil de Super Admin</h1>
        <p className="text-muted-foreground">
          Gestiona tu información de administrador y la configuración de la cuenta.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza los detalles de tu cuenta de administrador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">Nombre</Label>
              <Input id="first-name" defaultValue="Alexander" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="last-name">Apellido</Label>
              <Input id="last-name" defaultValue="Jerez Fernandez" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue="allseosoporte@gmail.com" readOnly />
             <p className="text-xs text-muted-foreground pt-1">El correo electrónico no se puede modificar.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar Cambios</Button>
        </CardFooter>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input id="current-password" type="password" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Actualizar Contraseña</Button>
        </CardFooter>
      </Card>

    </div>
  );
}
