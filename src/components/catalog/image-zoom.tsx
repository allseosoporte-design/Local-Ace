'use client';

import { useState, useRef, type MouseEvent } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Lightbox } from './lightbox';

interface ImageZoomProps {
  src: string;
  alt: string;
  zoom?: number;
  className?: string;
}

export function ImageZoom({ src, alt, zoom = 2, className }: ImageZoomProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bgPosX = -(x * zoom - 100); // 100 is half lens size
    const bgPosY = -(y * zoom - 100);

    setPosition({ x: bgPosX, y: bgPosY });
    setCursorPosition({ x: x - 50, y: y - 50 }); // 50 is half lens size
  };

  return (
    <>
      <div
        ref={containerRef}
        className={cn("relative w-full aspect-square overflow-hidden cursor-zoom-in", className)}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          style={{ opacity: showZoom ? 0.7 : 1 }}
        />

        {showZoom && (
          <div
            className="absolute bg-white/30 border-2 border-primary pointer-events-none rounded-full"
            style={{
              width: '100px',
              height: '100px',
              top: `${cursorPosition.y}px`,
              left: `${cursorPosition.x}px`,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
      </div>

      {showZoom && (
         <div className="hidden lg:block absolute top-0 left-full ml-4 w-[400px] h-[400px] border-2 border-primary bg-white shadow-2xl overflow-hidden pointer-events-none z-50 rounded-lg">
            <div
                style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: `${position.x}px ${position.y}px`,
                backgroundSize: `${containerRef.current?.offsetWidth! * zoom}px ${containerRef.current?.offsetHeight! * zoom}px`,
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%',
                }}
            />
        </div>
      )}
      
      <Lightbox 
        src={src}
        alt={alt}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}