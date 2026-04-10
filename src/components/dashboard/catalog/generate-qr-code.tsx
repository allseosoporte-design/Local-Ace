'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { useUser } from '@/firebase';

/**
 * Componente para generar y descargar el código QR del catálogo del negocio.
 */
export function GenerateQRCode() {
  const { user } = useUser();

  if (!user) return null;

  // Calculamos el enlace del catálogo basándonos en el origen actual y el UID del usuario
  const catalogLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/catalog/${user.uid}`
    : '';
  
  // URL de la API de generación de QR (400x400)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(catalogLink)}`;

  /**
   * Maneja la descarga de la imagen del código QR
   */
  const handleDownload = async (): Promise<void> => {
    if (!catalogLink) return;
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-catalogo-${user.uid}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando el código QR:', error);
    }
  };

  return (
    <Card className="mt-6 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary">
          <QrCode className="h-5 w-5" />
          Generar Código QR
        </CardTitle>
        <CardDescription>
          Tu código QR personal para que los clientes accedan instantáneamente a tu catálogo digital.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-8">
        <div className="bg-white p-6 rounded-2xl border-4 border-white shadow-xl ring-1 ring-primary/10">
          <img
            src={qrImageUrl}
            alt="Código QR del Catálogo"
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
          />
        </div>
        
        <div className="text-center space-y-2 w-full max-w-[300px]">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Enlace de acceso directo</p>
            <div className="bg-muted p-2 rounded border text-[10px] font-mono break-all text-center text-muted-foreground">
                {catalogLink || 'Cargando enlace...'}
            </div>
        </div>

        <Button 
            onClick={handleDownload} 
            className="w-full sm:w-auto font-semibold px-8"
            size="lg"
            disabled={!catalogLink}
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar Código QR
        </Button>
      </CardContent>
    </Card>
  );
}
