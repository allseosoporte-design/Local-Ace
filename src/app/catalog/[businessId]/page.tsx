
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeNav } from '@/components/home-nav';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import type { Product } from '@/types/product';
import { Loader2 } from 'lucide-react';
import { ProductViewModal } from '@/components/catalog/product-view-modal';
import { CartButton } from '@/components/cart/cart-button';
import { CartCheckoutModal } from '@/components/cart/cart-checkout-modal';
import { CatalogHeader } from '@/components/catalog/catalog-header';
import { StarRatingDisplay } from '@/components/catalog/star-rating-display';
import { useToast } from '@/hooks/use-toast';


function ProductCard({ product, onProductSelect }: { product: Product, onProductSelect: (product: Product) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleRatingSubmit = async (newRating: number) => {
    if (!firestore || !product || isSubmitting) return;

    setIsSubmitting(true);
    try {
        const productRef = doc(firestore, 'products', product.id);

        const currentTotalRating = (product.rating || 0) * (product.ratingCount || 0);
        const newRatingCount = (product.ratingCount || 0) + 1;
        const newAverageRating = (currentTotalRating + newRating) / newRatingCount;

        await updateDoc(productRef, {
            rating: newAverageRating,
            ratingCount: increment(1)
        });
        
        toast({
            title: '¡Gracias por tu valoración!',
            description: `Has valorado "${product.name}" con ${newRating} estrellas.`,
        });

    } catch (error) {
        console.error("Error submitting rating:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar tu valoración."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card 
        className="w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-1 flex flex-col"
    >
      <div className="cursor-pointer" onClick={() => onProductSelect(product)}>
        <CardHeader className="p-0">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src={product.imageUrls?.[0] || 'https://placehold.co/400x300'}
                alt={product.name}
                fill
                className="object-cover"
            />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg font-semibold leading-tight h-12">
            {product.name}
            </CardTitle>
            
            <p className="text-2xl font-bold text-primary mt-2">
            {formatCurrency(product.price)}
            </p>
        </CardContent>
      </div>
       <div className="px-4 pb-2">
         <StarRatingDisplay 
            productId={product.id}
            rating={product.rating || 0} 
            ratingCount={product.ratingCount}
            onRatingSubmit={handleRatingSubmit}
            isSubmitting={isSubmitting}
        />
       </div>
      <CardFooter className="p-4 pt-2 mt-auto">
        <Button className="w-full" onClick={() => onProductSelect(product)}>Ver Producto</Button>
      </CardFooter>
    </Card>
  );
}

export default function CatalogPageComponent({ params }: { params: { businessId: string } }) {
  const { businessId } = params;
  const firestore = useFirestore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productsQuery = useMemo(() => {
    if (!firestore || !businessId) return null;
    return query(
      collection(firestore, 'products'),
      where('businessId', '==', businessId)
    );
  }, [firestore, businessId]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-muted/40">
        <HomeNav />
        <CatalogHeader businessId={businessId} />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                    key={product.id} 
                    product={product}
                    onProductSelect={handleProductSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No hay productos disponibles en este momento.
              </p>
            </div>
          )}
        </main>
         <footer className="flex items-center justify-center py-6 border-t bg-background">
            <p className="text-xs text-muted-foreground">&copy; 2024 Local Leap. Todos los derechos reservados.</p>
        </footer>
      </div>
      
      <ProductViewModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <CartButton />
      <CartCheckoutModal />
    </>
  );
}
