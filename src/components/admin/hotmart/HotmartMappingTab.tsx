'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PlusCircle, Trash2, Loader2, Copy, Link as LinkIcon } from 'lucide-react';
import type { HotmartPlanMapping } from '@/types/hotmart';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export function HotmartMappingTab() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const mappingQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotmartPlanMappings'));
  }, [firestore]);

  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'subscriptionPlans'));
  }, [firestore]);

  const { data: mappings, isLoading: isLoadingMappings } = useCollection<HotmartPlanMapping>(mappingQuery);
  const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansQuery);

  const [newMapping, setNewMapping] = useState<Partial<HotmartPlanMapping>>({
    offerId: '',
    offerName: '',
    internalPlanId: '',
    hotlinkUrl: '',
    active: true
  });

  const handleAddMapping = async () => {
    if (!firestore) return;
    if (!newMapping.offerId || !newMapping.internalPlanId || !newMapping.hotlinkUrl) {
      toast({ variant: 'destructive', title: 'Faltan campos', description: 'OfferId, Plan SaaS y HotLink son obligatorios.' });
      return;
    }

    setIsSaving(true);
    try {
      const id = uuidv4();
      // 1. Guardar el mapeo
      await setDoc(doc(firestore, 'hotmartPlanMappings', id), {
        ...newMapping,
        id,
        createdAt: serverTimestamp()
      });

      // 2. Sincronizar el HotLink con el Plan de Suscripción (Operación Quirúrgica)
      const planRef = doc(firestore, 'subscriptionPlans', newMapping.internalPlanId);
      await updateDoc(planRef, { 
        checkoutUrl: newMapping.hotlinkUrl,
        updatedAt: serverTimestamp()
      });

      setNewMapping({ offerId: '', offerName: '', internalPlanId: '', hotlinkUrl: '', active: true });
      toast({ title: 'Mapeo creado', description: 'La oferta ha sido vinculada y sincronizada con el plan.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el mapeo.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, internalPlanId: string) => {
    if (!firestore) return;
    try {
      // 1. Eliminar el mapeo
      await deleteDoc(doc(firestore, 'hotmartPlanMappings', id));
      
      // 2. Limpiar el HotLink en el plan correspondiente
      if (internalPlanId) {
          const planRef = doc(firestore, 'subscriptionPlans', internalPlanId);
          await updateDoc(planRef, { 
            checkoutUrl: "", 
            updatedAt: serverTimestamp() 
          });
      }

      toast({ title: 'Mapeo eliminado', description: 'Se ha desvinculado la oferta del plan.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar' });
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copiado', description: 'HotLink copiado al portapapeles.' });
  }

  const isLoading = isLoadingMappings || isLoadingPlans;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vincular Ofertas y HotLinks</CardTitle>
          <CardDescription>Asocia los HotLinks de Hotmart con tus planes internos para habilitar el checkout directo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-muted/20 p-4 rounded-lg">
            <div className="space-y-2">
              <Label>Offer ID (Hotmart)</Label>
              <Input 
                value={newMapping.offerId} 
                onChange={(e) => setNewMapping(prev => ({ ...prev, offerId: e.target.value }))}
                placeholder="Ej: OFF-123" 
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre Oferta</Label>
              <Input 
                value={newMapping.offerName} 
                onChange={(e) => setNewMapping(prev => ({ ...prev, offerName: e.target.value }))}
                placeholder="Ej: Plan Pro Anual" 
              />
            </div>
            <div className="space-y-2">
              <Label>Plan SaaS</Label>
              <Select 
                value={newMapping.internalPlanId} 
                onValueChange={(val) => setNewMapping(prev => ({ ...prev, internalPlanId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link de Pago (HotLink)</Label>
              <Input 
                value={newMapping.hotlinkUrl} 
                onChange={(e) => setNewMapping(prev => ({ ...prev, hotlinkUrl: e.target.value }))}
                placeholder="https://go.hotmart.com/..." 
              />
            </div>
            <Button onClick={handleAddMapping} disabled={isSaving || isLoading} className="w-full">
              {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Vincular
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan SaaS</TableHead>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>HotLink</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : !mappings || mappings.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay mapeos configurados.</TableCell></TableRow>
                ) : (
                  mappings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {plans?.find(p => p.id === m.internalPlanId)?.name || 'Plan no encontrado'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.offerId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <span className="truncate max-w-[150px] text-xs opacity-70">{m.hotlinkUrl}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyLink(m.hotlinkUrl)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.active ? 'default' : 'secondary'}>{m.active ? 'Activo' : 'Inactivo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id, m.internalPlanId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
