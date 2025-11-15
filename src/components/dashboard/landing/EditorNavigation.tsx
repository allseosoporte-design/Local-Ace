'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, GripVertical, Facebook, Twitter, Instagram, Linkedin, Youtube, Rss, UploadCloud, Loader2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LandingPageData, NavLink, HeaderConfig, FooterConfig, FooterColumn, FooterLink, SocialLink } from '@/components/editor-landing-preview';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/ai/flows/upload-image';
import { cn } from '@/lib/utils';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';

interface EditorNavigationProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData | null>>;
}

export function EditorNavigation({ data, setData }: EditorNavigationProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user && data.navigation.links.some(link => link.text === 'Catálogo')) {
        return; // Ya existe, no hacer nada.
    }
    
    if (user) {
        const catalogUrl = user.uid === SUPER_ADMIN_BUSINESS_ID ? '/catalog' : `/catalog/${user.uid}`;
        const catalogLink: NavLink = {
            id: 'catalog-link',
            text: 'Catálogo',
            url: catalogUrl,
            order: (data.navigation.links.length || 0) + 1,
            newTab: false,
        };

        // Prevenir duplicados si se re-renderiza
        const existingLinks = data.navigation.links || [];
        if (!existingLinks.find(link => link.id === 'catalog-link')) {
             setData(prev => prev ? ({ ...prev, navigation: { ...prev.navigation, links: [...existingLinks, catalogLink] } }) : null);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, data.navigation.links, setData]);


  if (!data || !setData) {
    return <Loader2 className="animate-spin" />;
  }

  const handleHeaderChange = (field: keyof HeaderConfig, value: any) => {
    setData(prev => prev ? ({ ...prev, navigation: { ...(prev.navigation as HeaderConfig), [field]: value } }) : null);
  };
  
  const handleLogoUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const fileAsDataUrl = reader.result as string;
            const result = await uploadImage({ fileAsDataUrl, folder: `logos/${user.uid}`});
            handleHeaderChange('logoUrl', result.imageUrl);
            toast({ title: "Logo subido", description: "El logo se ha actualizado exitosamente." });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo subir el logo." });
    } finally {
        setIsUploading(false);
    }
  }

  const handleNavLinkChange = (id: string, field: keyof NavLink, value: any) => {
    const updatedLinks = data.navigation.links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    );
    handleHeaderChange('links', updatedLinks);
  };

  const addNavLink = () => {
    const newLink: NavLink = {
      id: uuidv4(),
      text: 'Nuevo Enlace',
      url: '#',
      order: data.navigation.links.length,
      newTab: false
    };
    handleHeaderChange('links', [...data.navigation.links, newLink]);
  };
  
  const removeNavLink = (id: string) => {
    handleHeaderChange('links', data.navigation.links.filter(link => link.id !== id));
  };
  
  // Footer Handlers
  const handleFooterChange = (field: keyof FooterConfig, value: any) => {
      setData(prev => prev ? ({ ...prev, footer: { ...(prev.footer as FooterConfig), [field]: value } }) : null);
  };

  const addFooterColumn = () => {
      const newColumn: FooterColumn = { id: uuidv4(), title: 'Nueva Columna', links: [] };
      handleFooterChange('columns', [...(data.footer?.columns || []), newColumn]);
  };

  const removeFooterColumn = (id: string) => {
      handleFooterChange('columns', (data.footer?.columns || []).filter(col => col.id !== id));
  };
  
  const handleFooterColumnChange = (id: string, title: string) => {
       const updatedColumns = (data.footer?.columns || []).map(col => col.id === id ? {...col, title} : col);
       handleFooterChange('columns', updatedColumns);
  }
  
  const addFooterLink = (columnId: string) => {
      const newLink: FooterLink = { id: uuidv4(), text: 'Enlace', url: '#' };
      const updatedColumns = (data.footer?.columns || []).map(col => 
          col.id === columnId ? {...col, links: [...col.links, newLink]} : col
      );
      handleFooterChange('columns', updatedColumns);
  }
  
  const removeFooterLink = (columnId: string, linkId: string) => {
      const updatedColumns = (data.footer?.columns || []).map(col => 
          col.id === columnId ? {...col, links: col.links.filter(l => l.id !== linkId)} : col
      );
      handleFooterChange('columns', updatedColumns);
  }
  
  const handleFooterLinkChange = (columnId: string, linkId: string, field: keyof FooterLink, value: string) => {
      const updatedColumns = (data.footer?.columns || []).map(col => {
          if (col.id === columnId) {
              const updatedLinks = col.links.map(l => l.id === linkId ? {...l, [field]: value} : l);
              return {...col, links: updatedLinks};
          }
          return col;
      });
      handleFooterChange('columns', updatedColumns);
  }
  
  const addSocialLink = () => {
    const newSocial: SocialLink = { id: uuidv4(), network: 'facebook', url: '' };
    handleFooterChange('socialLinks', [...(data.footer?.socialLinks || []), newSocial]);
  }
  
  const removeSocialLink = (id: string) => {
    handleFooterChange('socialLinks', (data.footer?.socialLinks || []).filter(sl => sl.id !== id));
  }
  
  const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: any) => {
    const updatedSocials = (data.footer?.socialLinks || []).map(sl => sl.id === id ? {...sl, [field]: value} : sl);
    handleFooterChange('socialLinks', updatedSocials);
  }
  

  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none bg-[#FEFBF9]">
      <CardContent className="space-y-6 pt-6">
        <Accordion type="multiple" defaultValue={['header', 'footer']} className="w-full space-y-4">
          
          {/* Header Section */}
          <AccordionItem value="header" className='border rounded-lg bg-background'>
            <AccordionTrigger className="px-4 text-lg font-semibold hover:no-underline">Barra Superior (Header)</AccordionTrigger>
            <AccordionContent className="p-4 space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="header-enabled" className="font-semibold">Habilitar Barra Superior</Label>
                  <Switch id="header-enabled" checked={data.navigation.enabled} onCheckedChange={(val) => handleHeaderChange('enabled', val)} />
              </div>

              {data.navigation.enabled && (
                <>
                  <div className="space-y-4 p-4 border rounded-lg">
                      <Label className="font-semibold text-base">Logo del Negocio</Label>
                       <div className="flex gap-4 items-center">
                          <div className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                              {isUploading ? (
                                <Loader2 className="h-6 w-6 animate-spin"/>
                              ) : data.navigation.logoUrl ? (
                                <Image src={data.navigation.logoUrl} alt="Logo preview" fill style={{ objectFit: 'contain', padding: '4px'}}/>
                              ) : (
                                <UploadCloud className="h-8 w-8 text-muted-foreground"/>
                              )}
                          </div>
                           <div className="space-y-2">
                               <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                               <Button type="button" onClick={handleLogoUploadClick} disabled={isUploading}>+ Subir Logo</Button>
                               {data.navigation.logoUrl && <Button type="button" variant="destructive" size="sm" onClick={() => handleHeaderChange('logoUrl', null)}>Eliminar</Button>}
                           </div>
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="logo-text">Texto Alternativo (si no hay logo)</Label>
                           <Input id="logo-text" value={data.navigation.logoText} onChange={(e) => handleHeaderChange('logoText', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                           <Label>Ancho del Logo: {data.navigation.logoWidth}px</Label>
                           <Slider defaultValue={[data.navigation.logoWidth]} max={200} min={30} step={1} onValueChange={([val]) => handleHeaderChange('logoWidth', val)} />
                       </div>
                       <div className="space-y-2">
                           <Label>Alineación</Label>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant={data.navigation.logoAlignment === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleHeaderChange('logoAlignment', 'left')}><AlignLeft/></Button>
                                <Button type="button" variant={data.navigation.logoAlignment === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleHeaderChange('logoAlignment', 'center')}><AlignCenter/></Button>
                                <Button type="button" variant={data.navigation.logoAlignment === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleHeaderChange('logoAlignment', 'right')}><AlignRight/></Button>
                            </div>
                       </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-semibold">Enlaces de Navegación</Label>
                    {data.navigation.links.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <Input value={link.text} onChange={(e) => handleNavLinkChange(link.id, 'text', e.target.value)} placeholder="Texto del enlace" className="flex-1"/>
                        <Input value={link.url} onChange={(e) => handleNavLinkChange(link.id, 'url', e.target.value)} placeholder="URL" className="flex-1"/>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`new-tab-${link.id}`} className="text-xs">Nueva Pestaña</Label>
                          <Switch id={`new-tab-${link.id}`} checked={link.newTab} onCheckedChange={(val) => handleNavLinkChange(link.id, 'newTab', val)} />
                        </div>
                        <Input type="number" value={link.order} onChange={(e) => handleNavLinkChange(link.id, 'order', parseInt(e.target.value) || 0)} className="w-16 text-center"/>
                        <Button variant="ghost" size="icon" onClick={() => removeNavLink(link.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addNavLink}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Enlace</Button>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-semibold">Estilos de la Barra Superior</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Color de Fondo</Label>
                            <Input type="color" value={data.navigation.backgroundColor} onChange={(e) => handleHeaderChange('backgroundColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Color de Texto</Label>
                            <Input type="color" value={data.navigation.textColor} onChange={(e) => handleHeaderChange('textColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Color Hover</Label>
                            <Input type="color" value={data.navigation.hoverColor} onChange={(e) => handleHeaderChange('hoverColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                         <div className="flex items-center gap-2 border p-3 rounded-md">
                            <Label htmlFor="header-shadow">Sombra</Label>
                            <Switch id="header-shadow" checked={data.navigation.shadow} onCheckedChange={(val) => handleHeaderChange('shadow', val)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Tamaño Fuente (px)</Label>
                            <Input type="number" value={data.navigation.fontSize} onChange={(e) => handleHeaderChange('fontSize', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Espaciado (px)</Label>
                            <Input type="number" value={data.navigation.spacing} onChange={(e) => handleHeaderChange('spacing', e.target.value)} />
                        </div>
                     </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Footer Section */}
          <AccordionItem value="footer" className='border rounded-lg bg-background'>
            <AccordionTrigger className="px-4 text-lg font-semibold hover:no-underline">Pie de Página (Footer)</AccordionTrigger>
            <AccordionContent className="p-4 space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="footer-enabled" className="font-semibold">Habilitar Pie de Página</Label>
                  <Switch id="footer-enabled" checked={data.footer.enabled} onCheckedChange={(val) => handleFooterChange('enabled', val)} />
              </div>
              {data.footer.enabled && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="copyright">Texto de Copyright</Label>
                        <Input id="copyright" value={data.footer.copyrightText} onChange={(e) => handleFooterChange('copyrightText', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={data.footer.address} onChange={(e) => handleFooterChange('address', e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" type="tel" value={data.footer.phone} onChange={(e) => handleFooterChange('phone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.footer.email} onChange={(e) => handleFooterChange('email', e.target.value)} />
                        </div>
                     </div>

                    <div className="space-y-4">
                        <Label className="font-semibold">Columnas de Enlaces</Label>
                        {data.footer.columns.map(col => (
                            <Card key={col.id} className="bg-muted/50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Input value={col.title} onChange={(e) => handleFooterColumnChange(col.id, e.target.value)} placeholder="Título de columna" className="font-semibold"/>
                                    <Button variant="ghost" size="icon" onClick={() => removeFooterColumn(col.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                                <div className="space-y-2 pl-4">
                                {col.links.map(link => (
                                    <div key={link.id} className="flex items-center gap-2">
                                        <Input value={link.text} onChange={(e) => handleFooterLinkChange(col.id, link.id, 'text', e.target.value)} placeholder="Texto"/>
                                        <Input value={link.url} onChange={(e) => handleFooterLinkChange(col.id, link.id, 'url', e.target.value)} placeholder="URL"/>
                                        <Button variant="ghost" size="icon" onClick={() => removeFooterLink(col.id, link.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => addFooterLink(col.id)}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Enlace</Button>
                            </Card>
                        ))}
                         <Button variant="outline" onClick={addFooterColumn}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Columna</Button>
                    </div>

                    <div className="space-y-4">
                        <Label className="font-semibold">Redes Sociales</Label>
                        {data.footer.socialLinks.map(social => (
                            <div key={social.id} className="flex items-center gap-2">
                                <Select value={social.network} onValueChange={(val) => handleSocialLinkChange(social.id, 'network', val)}>
                                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="twitter">Twitter</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input value={social.url} onChange={(e) => handleSocialLinkChange(social.id, 'url', e.target.value)} placeholder="URL del perfil"/>
                                <Button variant="ghost" size="icon" onClick={() => removeSocialLink(social.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={addSocialLink}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Red Social</Button>
                    </div>

                     <div className="space-y-4">
                        <Label className="font-semibold">Estilos del Pie de Página</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Fondo</Label>
                                <Input type="color" value={data.footer.backgroundColor} onChange={(e) => handleFooterChange('backgroundColor', e.target.value)} className="p-1 h-10"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Texto</Label>
                                <Input type="color" value={data.footer.textColor} onChange={(e) => handleFooterChange('textColor', e.target.value)} className="p-1 h-10"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Íconos</Label>
                                <Input type="color" value={data.footer.iconColor} onChange={(e) => handleFooterChange('iconColor', e.target.value)} className="p-1 h-10"/>
                            </div>
                        </div>
                    </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </CardContent>
    </Card>
  );
}
