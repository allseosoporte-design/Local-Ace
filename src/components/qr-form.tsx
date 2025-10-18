
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud } from 'lucide-react';
import { uploadImage } from '@/ai/flows/upload-image';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

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

export const QRForm = ({methodName, data, setData}: QRFormProps) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useUser();
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
                  folder: `payment_qrs/${user.uid}/${methodName.toLowerCase()}`
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
                        <Label htmlFor="qrImageUrl">Imagen del Código QR</Label>
                        <Input 
                            id="qr-code-file"
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="holderName">Titular</Label>
                        <Input id="holderName" value={data.holderName} onChange={handleInputChange} placeholder='Ej: Alexander Jerez' />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número de cuenta</Label>
                        <Input id="accountNumber" value={data.accountNumber} onChange={handleInputChange} placeholder='Ej: 3116028254' />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vista Previa del QR</Label>
                        <div className="w-[200px] h-[200px] bg-gray-200 rounded-md flex items-center justify-center mx-auto border">
                             {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                             ) : data.qrImageUrl ? (
                                <Image src={data.qrImageUrl} alt="QR Code Preview" width={200} height={200} className="rounded-md object-contain" />
                            ) : (
                                <div className='text-center text-muted-foreground'>
                                    <UploadCloud className='mx-auto h-10 w-10 mb-2'/>
                                    <p className="text-sm">Sube una imagen</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
