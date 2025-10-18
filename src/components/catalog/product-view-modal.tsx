
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductViewModal({ product, isOpen, onOpenChange }: ProductViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(product?.imageUrls?.[0] || null);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Reset selected image when a new product is passed
    if (product?.imageUrls?.[0]) {
      setSelectedImage(product.imageUrls[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido al carrito.`,
    });
    onOpenChange(false);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                 <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.imageUrls?.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(url)}
                  className={cn(
                    'relative aspect-square w-full rounded-md overflow-hidden border-2 transition',
                    selectedImage === url ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <Image
                    src={url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <ScrollArea className="h-[calc(100vh-10rem)] md:h-auto max-h-[80vh]">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl lg:text-3xl font-bold">{product.name}</DialogTitle>
                 <Badge variant="outline" className="w-fit">{product.category}</Badge>
              </DialogHeader>
              <div className="px-6 py-4 space-y-4">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                
                <Separator />
                
                <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    {product.description ? (
                         <div 
                            className="prose prose-sm max-w-none text-muted-foreground ql-editor"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                         />
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay descripción disponible para este producto.</p>
                    )}
                </div>

                <Separator />
                
                <div className="text-sm text-muted-foreground">
                    Stock disponible: {product.stock}
                </div>
              </div>
            </ScrollArea>
             <DialogFooter className="p-6 border-t mt-auto bg-muted/50">
                <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5"/>
                    Agregar al Carrito
                </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
