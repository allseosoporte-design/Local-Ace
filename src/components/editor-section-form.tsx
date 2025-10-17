
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Section, Subsection } from './editor-landing-preview';
import { v4 as uuidv4 } from 'uuid';
import { EditorSubsectionForm } from './editor-subsection-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import RichTextEditor from './editor/RichTextEditor';

interface EditorSectionFormProps {
  section: Section;
  updateSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
}

export function EditorSectionForm({ section, updateSection, deleteSection }: EditorSectionFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateSection({ ...section, [e.target.name]: e.target.value });
  };
  
  const handleContentChange = (content: string) => {
    updateSection({ ...section, content });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     updateSection({ ...section, [e.target.name]: e.target.value });
  }

  const addSubsection = () => {
    const newSubsection: Subsection = {
        id: uuidv4(),
        title: "Nuevo Título",
        description: "Nueva descripción para la subsección.",
        imageUrl: `https://picsum.photos/seed/${uuidv4()}/200/200`
    };
    updateSection({ ...section, subsections: [...section.subsections, newSubsection] });
  };

  const updateSubsection = (updatedSubsection: Subsection) => {
    updateSection({
        ...section,
        subsections: section.subsections.map(sub => sub.id === updatedSubsection.id ? updatedSubsection : sub)
    });
  };

  const deleteSubsection = (subsectionId: string) => {
    updateSection({
        ...section,
        subsections: section.subsections.filter(sub => sub.id !== subsectionId)
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
            <div className="bg-white rounded-lg border shadow-sm flex justify-between items-center p-4">
                <AccordionTrigger className="w-full text-lg font-semibold hover:no-underline">
                   {section.title}
                </AccordionTrigger>
                <Button variant="ghost" size="icon" onClick={() => deleteSection(section.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
            </div>
            <AccordionContent>
                <Card className="border-t-0 rounded-t-none bg-[#FDF4ED]">
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor={`title-${section.id}`}>Título Principal</Label>
                                <Input id={`title-${section.id}`} name="title" value={section.title} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`subtitle-${section.id}`}>Subtítulo</Label>
                                <Input id={`subtitle-${section.id}`} name="subtitle" value={section.subtitle} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Contenido Adicional (HTML)</Label>
                          <RichTextEditor
                            value={section.content}
                            onChange={handleContentChange}
                            placeholder="Describe la sección..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`backgroundColor-${section.id}`}>Color de Fondo</Label>
                                <Input id={`backgroundColor-${section.id}`} name="backgroundColor" type="color" value={section.backgroundColor} onChange={handleColorChange} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`textColor-${section.id}`}>Color de Texto</Label>
                                <Input id={`textColor-${section.id}`} name="textColor" type="color" value={section.textColor} onChange={handleColorChange} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`sectionColor-${section.id}`}>Color de Sección</Label>
                                <Input id={`sectionColor-${section.id}`} name="sectionColor" type="color" value={section.sectionColor} onChange={handleColorChange} className="p-1 h-10" />
                            </div>
                        </div>
                        
                        <div>
                            <CardTitle className='mb-4 text-base'>Subsecciones (Columnas/Tarjetas)</CardTitle>
                            <div className='space-y-4'>
                                {section.subsections.map((subsection, index) => (
                                    <EditorSubsectionForm 
                                        key={subsection.id}
                                        subsection={subsection}
                                        updateSubsection={updateSubsection}
                                        deleteSubsection={deleteSubsection}
                                        index={index}
                                    />
                                ))}
                            </div>
                            <Button variant="outline" onClick={addSubsection} className='mt-4'>
                                <PlusCircle className='h-4 w-4 mr-2'/>
                                Agregar Subsección
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  );
}
