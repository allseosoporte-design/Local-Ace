
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, GripVertical, Facebook, Twitter, Instagram, Linkedin, Youtube, Rss } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LandingPageData, NavLink, HeaderConfig, FooterConfig, FooterColumn, FooterLink, SocialLink } from '@/components/editor-landing-preview';

interface EditorNavigationProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorNavigation({ data, setData }: EditorNavigationProps) {
  
  const handleHeaderChange = (field: keyof HeaderConfig, value: any) => {
    setData(prev => ({ ...prev, navigation: { ...prev.navigation, [field]: value } }));
  };

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
      setData(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  };

  const addFooterColumn = () => {
      const newColumn: FooterColumn = { id: uuidv4(), title: 'Nueva Columna', links: [] };
      handleFooterChange('columns', [...data.footer.columns, newColumn]);
  };

  const removeFooterColumn = (id: string) => {
      handleFooterChange('columns', data.footer.columns.filter(col => col.id !== id));
  };
  
  const handleFooterColumnChange = (id: string, title: string) => {
       const updatedColumns = data.footer.columns.map(col => col.id === id ? {...col, title} : col);
       handleFooterChange('columns', updatedColumns);
  }
  
  const addFooterLink = (columnId: string) => {
      const newLink: FooterLink = { id: uuidv4(), text: 'Enlace', url: '#' };
      const updatedColumns = data.footer.columns.map(col => 
          col.id === columnId ? {...col, links: [...col.links, newLink]} : col
      );
      handleFooterChange('columns', updatedColumns);
  }
  
  const removeFooterLink = (columnId: string, linkId: string) => {
      const updatedColumns = data.footer.columns.map(col => 
          col.id === columnId ? {...col, links: col.links.filter(l => l.id !== linkId)} : col
      );
      handleFooterChange('columns', updatedColumns);
  }
  
  const handleFooterLinkChange = (columnId: string, linkId: string, field: keyof FooterLink, value: string) => {
      const updatedColumns = data.footer.columns.map(col => {
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
    handleFooterChange('socialLinks', [...data.footer.socialLinks, newSocial]);
  }
  
  const removeSocialLink = (id: string) => {
    handleFooterChange('socialLinks', data.footer.socialLinks.filter(sl => sl.id !== id));
  }
  
  const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: any) => {
    const updatedSocials = data.footer.socialLinks.map(sl => sl.id === id ? {...sl, [field]: value} : sl);
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

    