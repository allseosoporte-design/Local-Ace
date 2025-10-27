
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/product';
import { ProductModal } from '@/components/dashboard/catalog/product-modal';
import { ProductDataTable } from '@/components/dashboard/catalog/product-data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShareCatalog } from '@/components/dashboard/catalog/share-catalog';
import { CatalogHeaderConfig } from '@/components/dashboard/catalog/catalog-header-config';

export default function CatalogPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const productsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'products'),
      where('businessId', '==', user.uid)
    );
  }, [firestore, user]);

  const {
    data: products,
    isLoading: isLoadingProducts,
    error,
  } = useCollection<Product>(productsQuery);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmation = (product: Product) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productToDelete.id));
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado exitosamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
      });
      console.error('Error deleting product:', error);
    } finally {
      setIsAlertOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSave = async (data: Omit<Product, 'id' | 'businessId'>) => {
    if (!firestore || !user) return;
    try {
      const transformedData = {
        ...data,
        imageUrls: data.imageUrls.map((img: any) => (typeof img === 'object' ? img.value : img)),
      };

      if (editingProduct) {
        // Update
        const productRef = doc(firestore, 'products', editingProduct.id);
        await updateDoc(productRef, { ...transformedData, updatedAt: serverTimestamp() });
        toast({
          title: 'Producto actualizado',
          description: 'Los cambios han sido guardados.',
        });
      } else {
        // Create
        await addDoc(collection(firestore, 'products'), {
          ...transformedData,
          businessId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Producto creado',
          description: 'El nuevo producto ha sido añadido al catálogo.',
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el producto.',
      });
      console.error('Error saving product:', error);
    }
  };

  const isLoading = isUserLoading || (productsQuery && isLoadingProducts);

  if (error) {
    console.error("Firestore error:", error);
    toast({
        variant: "destructive",
        title: "Error de base de datos",
        description: "No se pudieron cargar los productos. Revisa los permisos de Firestore."
    })
  }

  return (
    <>
      <div className="space-y-6">
        <CatalogHeaderConfig />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tus Productos</CardTitle>
                <CardDescription>
                  Aquí puedes ver, editar y eliminar los productos de tu catálogo.
                </CardDescription>
              </div>
              <Button onClick={handleCreate} disabled={!user}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ProductDataTable
                data={products || []}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirmation}
              />
            )}
          </CardContent>
        </Card>
        
        <ShareCatalog />

      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              producto <span className='font-bold'>{productToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
