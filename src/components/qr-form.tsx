'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud } from 'lucide-react';
import { uploadImage } from '@/ai/flows/upload-image';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export interface QRFormData {
  enabled: boolean;
  qrImageUrl: string | null;
  accountNumber: string;
  holderName: string;
  idDocument: string;
  phone: string;
  isMainQR: boolean;
  instructions: string;
}

interface QRFormProps {
  methodName: 'Nequi' | 'Bancolombia' | 'Daviplata';
  data: QRFormData;
  setData: (data: QRFormData) => void;
}

export const QRForm = ({ methodName, data, setData }: QRFormProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fileAsDataUrl = reader.result as string;
        const result = await uploadImage({
          fileAsDataUrl,
          folder: `payment_qrs/${user.uid}/${methodName.toLowerCase()}`,
        });

        if (result.imageUrl) {
          setData({ ...data, qrImageUrl: result.imageUrl });
          toast({
            title: 'Imagen subida',
            description: 'El código QR se ha actualizado correctamente.',
          });
        }
      };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast({
        variant: 'destructive',
        title: 'Error de subida',
        description: 'No se pudo subir la imagen del código QR.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <Card className="mt-4 bg-white animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="text-base">
          Configuración para {methodName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holderName">Titular</Label>
              <Input
                id="holderName"
                value={data.holderName}
                onChange={handleInputChange}
                placeholder="Ej: John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Número de cuenta/teléfono</Label>
              <Input
                id="accountNumber"
                value={data.accountNumber}
                onChange={handleInputChange}
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <Label>Código QR</Label>
            <div
              className="w-[200px] h-[200px] bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed cursor-pointer"
              onClick={handleUploadClick}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : data.qrImageUrl ? (
                <Image
                  src={data.qrImageUrl}
                  alt="QR Code Preview"
                  width={200}
                  height={200}
                  className="rounded-md object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                  <p className="text-sm">Sube una imagen</p>
                </div>
              )}
            </div>
             <input
              ref={fileInputRef}
              id="qr-code-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
