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
 * Component to generate and download the QR code for the business landing page.
 * Strictly typed and production ready.
 */
export function GenerateQRCode() {
  const { user } = useUser();

  if (!user) return null;

  // Calculate the landing page link based on the current origin and user UID
  const landingPageLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/landing/${user.uid}`
    : '';
  
  // URL for the QR generation API (400x400)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(landingPageLink)}`;

  /**
   * Handles downloading the QR code image as a PNG file.
   */
  const handleDownload = async (): Promise<void> => {
    if (!landingPageLink) return;
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error('Failed to fetch QR image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-landing-${user.uid}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the QR code:', error);
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
          Tu código QR personal para que los clientes accedan instantáneamente a tu página web profesional.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-8">
        <div className="bg-white p-6 rounded-2xl border-4 border-white shadow-xl ring-1 ring-primary/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt="Código QR de la Landing Page"
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
          />
        </div>
        
        <div className="text-center space-y-2 w-full max-w-[300px]">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Enlace de acceso directo</p>
            <div className="bg-muted p-2 rounded border text-[10px] font-mono break-all text-center text-muted-foreground">
                {landingPageLink || 'Cargando enlace...'}
            </div>
        </div>

        <Button 
            onClick={handleDownload} 
            className="w-full sm:w-auto font-semibold px-8"
            size="lg"
            disabled={!landingPageLink}
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar Código QR
        </Button>
      </CardContent>
    </Card>
  );
}
