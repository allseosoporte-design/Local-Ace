
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { LandingPageData, Testimonial } from './editor-landing-preview';
import { v4 as uuidv4 } from 'uuid';
import { EditorTestimonialForm } from './editor-testimonial-form';

interface EditorTestimonialsProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorTestimonials({ data, setData }: EditorTestimonialsProps) {
  
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: uuidv4(),
      authorName: "Nuevo Testimonio",
      authorRole: "Cargo del autor",
      text: "Texto del testimonio...",
      avatarUrl: `https://picsum.photos/seed/${uuidv4()}/100/100`,
      rating: 5,
    };
    setData((prev) => ({ ...prev, testimonials: [...(prev.testimonials || []), newTestimonial] }));
  };

  const updateTestimonial = (updatedTestimonial: Testimonial) => {
    setData((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).map((t) => (t.id === updatedTestimonial.id ? updatedTestimonial : t)),
    }));
  };

  const deleteTestimonial = (testimonialId: string) => {
    setData((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((t) => t.id !== testimonialId),
    }));
  };

  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none bg-[#FEFBF9]">
      <CardHeader>
        <div className='flex justify-between items-center'>
            <div>
                <CardTitle className="text-lg flex items-center gap-2">
                    💬 Gestión de Testimonios
                </CardTitle>
                <CardDescription>
                    Edita los testimonios que se mostrarán en tu página principal.
                </CardDescription>
            </div>
            <Button onClick={addTestimonial} style={{backgroundColor: '#FF8550', color: 'white'}}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Testimonio
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(data.testimonials || []).map((testimonial) => (
          <EditorTestimonialForm 
            key={testimonial.id} 
            testimonial={testimonial} 
            updateTestimonial={updateTestimonial}
            deleteTestimonial={deleteTestimonial}
           />
        ))}
      </CardContent>
    </Card>
  );
}
