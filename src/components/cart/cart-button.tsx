'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useCartModal } from '@/context/cart-modal-context';

export function CartButton() {
  const { totalItems } = useCart();
  const { onOpen } = useCartModal();

  if (totalItems === 0) {
    return null;
  }

  return (
    <Button
      onClick={onOpen}
      variant="default"
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-8 w-8" />
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full text-xs"
      >
        {totalItems}
      </Badge>
    </Button>
  );
}
