
'use client';

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from 'react';

export default function AdminProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("Alexander");
  const [lastName, setLastName] = useState("Jerez Fernandez");
  const [phone, setPhone] = useState("+1 234 567 890");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveChanges = () => {
    // Lógica para guardar cambios en Firebase/backend
    console.log("Saving changes:", { firstName, lastName, phone });
    toast({
      title: "Cambios guardados",
      description: "Tu información personal ha sido actualizada.",
    });
  };
  
  const handleUpdatePassword = () => {
    // Lógica para actualizar contraseña
    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, rellena ambos campos de contraseña.",
      });
      return;
    }
    console.log("Updating password...");
    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente.",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      // Aquí iría la lógica para subir la imagen a Cloudinary y actualizar el estado del avatar
      toast({
        title: "Imagen seleccionada",
        description: `${file.name} lista para subir.`,
      });
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                    <AvatarImage src="https://avatar.vercel.sh/alexander.png" alt="Admin Avatar" />
                    <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button variant="outline" onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir nueva foto
                </Button>
            </div>
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="last-name">Apellido</Label>
                    <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" defaultValue="allseosoporte@gmail.com" readOnly />
                    <p className="text-xs text-muted-foreground pt-1">El correo electrónico no se puede modificar.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
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
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdatePassword}>Actualizar Contraseña</Button>
        </CardFooter>
      </Card>

    </div>
  );
}
