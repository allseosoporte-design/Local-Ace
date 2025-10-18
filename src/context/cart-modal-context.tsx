'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartModalContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export const useCartModal = () => {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error('useCartModal must be used within a CartModalProvider');
  }
  return context;
};

export const CartModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <CartModalContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </CartModalContext.Provider>
  );
};
