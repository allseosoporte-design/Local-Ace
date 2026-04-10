'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useCartModal } from '@/context/cart-modal-context';

/**
 * Componente de botón de carrito flotante.
 * Se ha reubicado a la parte superior derecha para evitar conflictos visuales
 * con el widget del chatbot y garantizar que sea "bien visible" para el cliente.
 */
export function CartButton() {
  const { totalItems } = useCart();
  const { onOpen } = useCartModal();

  // Se muestra el carrito siempre para que el cliente identifique dónde está,
  // cumpliendo con la solicitud de que sea "bien visible" incluso si está vacío.
  return (
    <Button
      onClick={onOpen}
      variant="default"
      className="fixed top-24 right-6 h-16 w-16 rounded-full shadow-2xl z-50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-primary text-primary-foreground border-2 border-white"
      aria-label="Ver carrito de compras"
    >
      <ShoppingCart className="h-8 w-8" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white shadow-lg animate-in zoom-in duration-300"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}
