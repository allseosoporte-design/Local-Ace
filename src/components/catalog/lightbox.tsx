'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface LightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ src, alt, isOpen, onClose }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in-20"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          className="object-contain w-full h-full rounded-lg"
          style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white h-10 w-10 bg-black/50 hover:bg-black/75 hover:text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </div>
  );
}