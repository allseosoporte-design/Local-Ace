
'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Star } from 'lucide-react';
import type { Testimonial } from './editor-landing-preview';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Slider } from './ui/slider';

interface EditorTestimonialFormProps {
  testimonial: Testimonial;
  updateTestimonial: (testimonial: Testimonial) => void;
  deleteTestimonial: (testimonialId: string) => void;
}

export function EditorTestimonialForm({ testimonial, updateTestimonial, deleteTestimonial }: EditorTestimonialFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateTestimonial({ ...testimonial, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (newRating: number) => {
    updateTestimonial({ ...testimonial, rating: newRating });
  }

  return (
     <Card className="bg-[#FAE9E1] border border-dashed">
        <CardContent className="p-4">
            <div className="flex justify-end">
                 <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(testimonial.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2 flex flex-col items-center">
                    <Label>Imagen del Autor</Label>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden">
                        <Image src={testimonial.avatarUrl} alt={testimonial.authorName} fill objectFit="cover" />
                    </div>
                    <Button variant="outline" size="sm">Seleccionar</Button>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`testimonial-name-${testimonial.id}`}>Nombre del Autor</Label>
                        <Input id={`testimonial-name-${testimonial.id}`} name="authorName" value={testimonial.authorName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`testimonial-role-${testimonial.id}`}>Cargo/Empresa del Autor</Label>
                        <Input id={`testimonial-role-${testimonial.id}`} name="authorRole" value={testimonial.authorRole} onChange={handleChange} />
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Label htmlFor={`testimonial-text-${testimonial.id}`}>Texto del Testimonio</Label>
                <Textarea id={`testimonial-text-${testimonial.id}`} name="text" value={testimonial.text} onChange={handleChange} className="min-h-[120px]" />
            </div>
            <div className="mt-4 space-y-2">
                <Label>Calificación</Label>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => handleRatingChange(i + 1)}>
                            <Star className={cn("h-6 w-6 cursor-pointer", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        </button>
                    ))}
                </div>
            </div>
        </CardContent>
     </Card>
  );
}
