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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/types/product';
import { Loader2 } from 'lucide-react';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { ProductViewModal } from '@/components/catalog/product-view-modal';

function ProductCard({ product, onProductSelect }: { product: Product, onProductSelect: (product: Product) => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card 
        className="w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-1 cursor-pointer"
        onClick={() => onProductSelect(product)}
    >
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
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold leading-tight truncate h-12">
          {product.name}
        </CardTitle>
        <p className="text-2xl font-bold text-primary mt-2">
          {formatCurrency(product.price)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Ver Producto</Button>
      </CardFooter>
    </Card>
  );
}

export default function CatalogPage() {
  const firestore = useFirestore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'products'),
      where('businessId', '==', SUPER_ADMIN_BUSINESS_ID)
    );
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-muted/40">
        <HomeNav />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Nuestro Catálogo
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra selección de productos de alta calidad, elegidos
              especialmente para ti.
            </p>
          </div>

          {isLoading ? (
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
    </>
  );
}
