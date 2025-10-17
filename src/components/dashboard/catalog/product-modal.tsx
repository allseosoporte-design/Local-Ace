
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X, Plus, Trash2, Pencil } from 'lucide-react';
import type { Product } from '@/types/product';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { uploadImage } from '@/ai/flows/upload-image';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  description: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser un número positivo.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  stock: z.coerce.number().int().nonnegative('El stock no puede ser negativo.'),
  imageUrls: z.array(z.string().url()).min(1, 'Se requiere al menos una imagen.'),
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductFormProps = Omit<Product, 'id' | 'businessId'>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormProps) => void;
  product: Product | null;
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToRemove, setImageToRemove] = useState<number | null>(null);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrls: [],
    },
  });
  
  const { fields, append, remove, setValue } = useFieldArray({
    control: form.control,
    name: "imageUrls"
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        imageUrls: product.imageUrls || [],
      });
      setSelectedImageIndex(0);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        imageUrls: [],
      });
       setSelectedImageIndex(0);
    }
  }, [product, form, isOpen]);

  const onSubmit = (data: ProductFormData) => {
    onSave(data);
  };
  
  const handleFileSelect = (index: number) => {
    if (isUploading !== null) return;
    if (fileInputRef.current) {
        fileInputRef.current.dataset.index = index.toString();
        fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const indexStr = event.target.dataset.index;
    const index = indexStr ? parseInt(indexStr, 10) : -1;

    if (!file || !user || index === -1) return;

    setIsUploading(index);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fileAsDataUrl = reader.result as string;
        const result = await uploadImage({
          fileAsDataUrl,
          folder: `products/${user.uid}`,
        });

        if (result.imageUrl) {
            const currentImageUrls = form.getValues('imageUrls');
            if (index < currentImageUrls.length) {
                const newImageUrls = [...currentImageUrls];
                newImageUrls[index] = result.imageUrl;
                setValue('imageUrls', newImageUrls);
            } else {
                setValue('imageUrls', [...currentImageUrls, result.imageUrl]);
            }
            setSelectedImageIndex(index);
            toast({
                title: 'Imagen subida',
                description: 'La imagen del producto se ha actualizado.',
            });
        }
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Error de subida',
        description: `No se pudo subir la imagen: ${error.message}`,
      });
    } finally {
      setIsUploading(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const confirmRemoveImage = (index: number) => {
    if(form.getValues('imageUrls').length <= 1) {
        toast({ variant: "destructive", title: "Acción no permitida", description: "Debe haber al menos una imagen."});
        return;
    }
    setImageToRemove(index);
  }

  const handleRemoveImage = () => {
    if (imageToRemove !== null) {
        const currentImageUrls = form.getValues('imageUrls');
        const newImageUrls = currentImageUrls.filter((_, i) => i !== imageToRemove);
        setValue('imageUrls', newImageUrls);

        if (selectedImageIndex >= imageToRemove) {
            setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
        }
        setImageToRemove(null);
    }
  };


  const mainImage = form.watch('imageUrls')[selectedImageIndex];
  const thumbnailImages = form.watch('imageUrls');


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Rellena los campos para {product ? 'actualizar' : 'crear'} un producto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Imágenes y Campos Principales */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrls"
                    render={() => (
                      <FormItem>
                        <FormLabel>Imágenes del Producto</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                             {/* Thumbnails */}
                            <div className="flex flex-col gap-2">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    className={cn(
                                    "relative w-16 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                                    selectedImageIndex === idx ? 'border-primary' : 'border-dashed',
                                    isUploading === idx ? 'cursor-not-allowed' : ''
                                    )}
                                    onClick={() => thumbnailImages[idx] && setSelectedImageIndex(idx)}
                                >
                                    {isUploading === idx ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : thumbnailImages[idx] ? (
                                    <>
                                        <Image
                                            src={thumbnailImages[idx]}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity" onClick={(e) => { e.stopPropagation(); handleFileSelect(idx); }}>
                                            <Pencil className="h-5 w-5 text-white" />
                                        </div>
                                    </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary" onClick={() => handleFileSelect(idx)}>
                                            <Plus className="h-6 w-6" />
                                        </div>
                                    )}
                                </button>
                                ))}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </div>

                             {/* Main Image */}
                            <div className="relative flex-1 aspect-square border-2 border-dashed rounded-lg flex items-center justify-center">
                               {mainImage ? (
                                <div className="w-full h-full">
                                    <Image
                                        src={mainImage}
                                        alt="Vista previa principal"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                     <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => confirmRemoveImage(selectedImageIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                               ) : (
                                 <div className="text-center text-muted-foreground p-4">
                                     <UploadCloud className="mx-auto h-12 w-12" />
                                     <p>Selecciona o sube una imagen</p>
                                </div>
                               )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Café Orgánico de Altura" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Columna Derecha: Descripción y Categoría */}
                <div className="space-y-4">
                   <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Bebidas Calientes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (Contenido Adicional)</FormLabel>
                        <FormControl>
                          <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onClose()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Producto
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <AlertDialog open={imageToRemove !== null} onOpenChange={(open) => !open && setImageToRemove(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible y eliminará la imagen del producto.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setImageToRemove(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveImage} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

    