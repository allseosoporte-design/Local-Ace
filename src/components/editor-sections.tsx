
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, Loader2 } from 'lucide-react';
import type { LandingPageData, Section } from './editor-landing-preview';
import { v4 as uuidv4 } from 'uuid';
import { EditorSectionForm } from './editor-section-form';
import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface EditorSectionsProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorSections({ data, setData }: EditorSectionsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const addSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      title: 'Nueva Sección',
      subtitle: 'Un subtítulo para la nueva sección',
      content: 'Contenido de la nueva sección...',
      backgroundColor: '#F9FAFB',
      textColor: '#1F2937',
      sectionColor: '#FF8550',
      subsections: [],
    };
    setData((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (updatedSection: Section) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setData((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId)
    }));
  };

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión para guardar los cambios.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const landingPageConfigRef = doc(firestore, `businesses/${user.uid}/landingPages`, 'config');
      await setDoc(landingPageConfigRef, {
        sections: data.sections,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: '¡Secciones guardadas!',
        description: 'La configuración de las secciones ha sido actualizada.',
      });
    } catch (error) {
      console.error('Error saving sections:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: 'No se pudo guardar la configuración de las secciones.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none bg-[#FEFBF9]">
      <CardHeader>
        <div className='flex justify-between items-center'>
            <div>
                <CardTitle className="text-lg flex items-center gap-2">
                    🧩 Secciones de Contenido
                </CardTitle>
                <CardDescription>
                    Edita las secciones que se mostrarán en la página principal.
                </CardDescription>
            </div>
            <Button onClick={addSection} style={{backgroundColor: '#FF8550', color: 'white'}}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Sección
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.sections.map((section) => (
          <EditorSectionForm 
            key={section.id} 
            section={section} 
            updateSection={updateSection}
            deleteSection={deleteSection}
           />
        ))}
         <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: '#FF8550', color: '#FFFFFF' }}>
             {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Secciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
