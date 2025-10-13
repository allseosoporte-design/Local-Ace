'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { uploadImage } from '@/ai/flows/upload-image';
import { useToast } from '@/hooks/use-toast';

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
    methodName: 'Nequi' | 'Bancolombia';
    data: QRFormData;
    setData: (data: QRFormData) => void;
}

export const QRForm = ({methodName, data, setData}: QRFormProps) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const fileAsDataUrl = reader.result as string;
                const result = await uploadImage({
                  fileAsDataUrl,
                  folder: `payment-qrs/${methodName.toLowerCase()}`
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
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };

    return (
        <>
            <div className="flex justify-end">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`switch-${methodName.toLowerCase()}`}>{methodName} está activado</Label>
                    <Switch 
                        id={`switch-${methodName.toLowerCase()}`}
                        checked={data.enabled}
                        onCheckedChange={(checked) => setData({ ...data, enabled: checked })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="qrImageUrl">Imagen con Código QR (URL)</Label>
                        <Input 
                            id="qrImageUrl"
                            placeholder='https://...' 
                            value={data.qrImageUrl || ''}
                            onChange={(e) => setData({ ...data, qrImageUrl: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`qr-code-file-${methodName.toLowerCase()}`}>o sube el archivo</Label>
                        <Input 
                            id={`qr-code-file-${methodName.toLowerCase()}`} 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número de cuenta asociado*</Label>
                        <Input id="accountNumber" value={data.accountNumber} onChange={handleInputChange} placeholder='3116028254' />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="holderName">Nombre del titular*</Label>
                        <Input id="holderName" value={data.holderName} onChange={handleInputChange} placeholder='Alexander Jerez Fernandez' />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idDocument">Documento de identidad*</Label>
                        <Input id="idDocument" value={data.idDocument} onChange={handleInputChange} placeholder='1111846661' />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vista Previa del QR</Label>
                        <div className="w-[240px] h-[240px] bg-gray-200 rounded-md flex items-center justify-center mx-auto border">
                             {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                             ) : data.qrImageUrl ? (
                                <Image src={data.qrImageUrl} alt="QR Code Preview" width={240} height={240} className="rounded-md object-contain" />
                            ) : (
                                <p className="text-sm text-muted-foreground">Sube una imagen</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 justify-center">
                            <Checkbox 
                                id="isMainQR"
                                checked={data.isMainQR}
                                onCheckedChange={(checked) => setData({ ...data, isMainQR: !!checked })}
                            />
                            <Label htmlFor="isMainQR">Establecer como QR principal</Label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={data.phone} onChange={handleInputChange} placeholder='(+57) 3116028254' />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="instructions">Instrucción para el cliente</Label>
                <Textarea id="instructions" value={data.instructions} onChange={handleInputChange} placeholder='Para validar tu pago, envía el comprobante a nuestro WhatsApp. Luego, nuestro equipo confirmará y activará tu plan.' />
            </div>
        </>
    );
};
