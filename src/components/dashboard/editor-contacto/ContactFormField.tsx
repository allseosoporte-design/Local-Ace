'use client';

import React from 'react';
import type { FormField } from '@/types/contact-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2 } from 'lucide-react';

interface ContactFormFieldProps {
    field: FormField;
    updateField: (id: string, updatedField: FormField) => void;
    removeField: (id: string) => void;
}

export const ContactFormField: React.FC<ContactFormFieldProps> = ({ field, updateField, removeField }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        updateField(field.id, {
            ...field,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    const handleTypeChange = (value: FormField['type']) => {
        updateField(field.id, { ...field, type: value });
    }

    return (
        <Card className="bg-muted/50 p-4">
            <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`label-${field.id}`}>Etiqueta</Label>
                        <Input 
                            id={`label-${field.id}`}
                            name="label" 
                            value={field.label} 
                            onChange={handleChange}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`type-${field.id}`}>Tipo de Campo</Label>
                        <Select value={field.type} onValueChange={handleTypeChange}>
                            <SelectTrigger id={`type-${field.id}`}>
                                <SelectValue placeholder="Tipo de campo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Teléfono</SelectItem>
                                <SelectItem value="textarea">Área de texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                        <Input 
                            id={`placeholder-${field.id}`}
                            name="placeholder"
                            value={field.placeholder} 
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 pl-4">
                    <div className='flex flex-col items-center gap-2'>
                        <Label htmlFor={`required-${field.id}`} className="text-xs">Requerido</Label>
                         <Switch 
                            id={`required-${field.id}`}
                            name="required"
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(field.id, {...field, required: checked})}
                         />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
