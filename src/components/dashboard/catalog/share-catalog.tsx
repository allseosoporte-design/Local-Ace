'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71v-2.3c.94.39 1.96.61 2.99.62.67.01 1.34-.09 1.98-.28 1.3-.38 2.44-.95 3.39-1.76.49-.42.92-.91 1.29-1.47.01-1.54.01-3.08.01-4.63h-4.69v-4.03h4.69c.01-1.13.02-2.26.01-3.39z"></path>
  </svg>
);

export function ShareCatalog() {
  const { toast } = useToast();
  const { user } = useUser();

  const handleShare = (platform: string) => {
    // This will be the public catalog link. For now, it points to a generic path.
    const catalogLink = `${window.location.origin}/catalog`;
    const encodedLink = encodeURIComponent(catalogLink);
    const text = encodeURIComponent('¡Mira nuestro catálogo de productos!');
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${text}%20${encodedLink}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${text}`;
        break;
      case 'tiktok':
      case 'instagram':
        navigator.clipboard.writeText(catalogLink);
        toast({
          title: 'Enlace copiado al portapapeles',
          description: `Pega el enlace en tu perfil de ${platform}.`,
        });
        return;
      default:
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparte tu Catálogo</CardTitle>
        <CardDescription>
          Promociona tus productos en redes sociales para aumentar las ventas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={() => handleShare('tiktok')}
            className="flex-1 min-w-[120px] transition-transform transform hover:scale-105"
            style={{ backgroundColor: '#010101', color: 'white' }}
          >
            <TikTokIcon />
            <span className="ml-2">TikTok</span>
          </Button>
          <Button
            onClick={() => handleShare('instagram')}
            className="flex-1 min-w-[120px] text-white transition-transform transform hover:scale-105"
            style={{
              background:
                'linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4)',
            }}
          >
            <Instagram />
            <span className="ml-2">Instagram</span>
          </Button>
          <Button
            onClick={() => handleShare('facebook')}
            className="flex-1 min-w-[120px] text-white transition-transform transform hover:scale-105"
            style={{ backgroundColor: '#1877F2' }}
          >
            <Facebook />
            <span className="ml-2">Facebook</span>
          </Button>
          <Button
            onClick={() => handleShare('whatsapp')}
            className="flex-1 min-w-[120px] text-white transition-transform transform hover:scale-105"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle />
            <span className="ml-2">WhatsApp</span>
          </Button>
          <Button
            onClick={() => handleShare('twitter')}
            className="flex-1 min-w-[120px] transition-transform transform hover:scale-105"
            style={{ backgroundColor: '#000000', color: 'white' }}
          >
            <Twitter />
            <span className="ml-2">X</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
