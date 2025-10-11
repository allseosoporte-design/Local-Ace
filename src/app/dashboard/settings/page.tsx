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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta, negocio y configuración de facturación.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar Perfil</Button>
        </CardFooter>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Negocio</CardTitle>
          <CardDescription>Gestiona los detalles de tu negocio y las opciones de marca blanca.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input id="business-name" defaultValue="The Cozy Corner Cafe" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select defaultValue="es">
              <SelectTrigger id="language">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="white-label" className="font-semibold">Modo Marca Blanca</Label>
              <p className="text-sm text-muted-foreground">
                Para que las agencias ofrezcan esta plataforma bajo su propia marca.
              </p>
            </div>
            <Switch id="white-label" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar Configuración del Negocio</Button>
        </CardFooter>
      </Card>
      
      <Separator />

       <Card>
        <CardHeader>
          <CardTitle>Facturación y Suscripción</CardTitle>
          <CardDescription>Gestiona tu plan de suscripción y métodos de pago.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">Plan Pro</p>
                        <p className="text-sm text-muted-foreground">$49.99 / mes</p>
                    </div>
                    <Button variant="outline">Cambiar Plan</Button>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">Próximo pago el 1 de Dic, 2024.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
