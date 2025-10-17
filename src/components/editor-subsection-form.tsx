
'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Subsection } from './editor-landing-preview';
import Image from 'next/image';
import RichTextEditor from './editor/RichTextEditor';

interface EditorSubsectionFormProps {
  subsection: Subsection;
  index: number;
  updateSubsection: (subsection: Subsection) => void;
  deleteSubsection: (subsectionId: string) => void;
}

export function EditorSubsectionForm({ subsection, index, updateSubsection, deleteSubsection }: EditorSubsectionFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateSubsection({ ...subsection, [e.target.name]: e.target.value });
  };
  
  const handleDescriptionChange = (description: string) => {
    updateSubsection({ ...subsection, description });
  };

  return (
     <Card className="bg-[#FDF4ED] border border-dashed">
        <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                 <Label>Tarjeta {index + 1}</Label>
                 <Button variant="ghost" size="icon" onClick={() => deleteSubsection(subsection.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`subsection-title-${subsection.id}`}>Título</Label>
                <Input id={`subsection-title-${subsection.id}`} name="title" value={subsection.title} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor={`subsection-desc-${subsection.id}`}>Descripción</Label>
                <RichTextEditor
                  value={subsection.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe la subsección..."
                />
            </div>
            <div className="space-y-2">
                <Label>Imagen</Label>
                <div className='flex items-center gap-4'>
                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                        <Image src={subsection.imageUrl} alt={subsection.title} fill objectFit="cover" />
                    </div>
                    <Button variant="outline">Seleccionar</Button>
                </div>
            </div>
        </CardContent>
     </Card>
  );
}
