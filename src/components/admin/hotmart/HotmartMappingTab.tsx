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
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
    active: true
  });

  const handleAddMapping = async () => {
    if (!firestore) return;
    if (!newMapping.offerId || !newMapping.internalPlanId) {
      toast({ variant: 'destructive', title: 'Faltan campos', description: 'El OfferId y el Plan SaaS son obligatorios.' });
      return;
    }

    setIsSaving(true);
    try {
      const id = uuidv4();
      await setDoc(doc(firestore, 'hotmartPlanMappings', id), {
        ...newMapping,
        id,
        createdAt: serverTimestamp()
      });
      setNewMapping({ offerId: '', offerName: '', internalPlanId: '', active: true });
      toast({ title: 'Mapeo creado', description: 'La oferta de Hotmart ha sido vinculada.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el mapeo.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'hotmartPlanMappings', id));
      toast({ title: 'Mapeo eliminado' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar' });
    }
  };

  const isLoading = isLoadingMappings || isLoadingPlans;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vincular Ofertas Hotmart</CardTitle>
          <CardDescription>Asocia los códigos de oferta de Hotmart con tus planes internos del SaaS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-muted/20 p-4 rounded-lg">
            <div className="space-y-2">
              <Label>Offer ID (Hotmart)</Label>
              <Input 
                value={newMapping.offerId} 
                onChange={(e) => setNewMapping(prev => ({ ...prev, offerId: e.target.value }))}
                placeholder="Ej: OFF-123" 
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre Descriptivo</Label>
              <Input 
                value={newMapping.offerName} 
                onChange={(e) => setNewMapping(prev => ({ ...prev, offerName: e.target.value }))}
                placeholder="Ej: Plan Anual Promo" 
              />
            </div>
            <div className="space-y-2">
              <Label>Plan SaaS</Label>
              <Select 
                value={newMapping.internalPlanId} 
                onValueChange={(val) => setNewMapping(prev => ({ ...prev, internalPlanId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddMapping} disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Vincular
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Plan Interno</TableHead>
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
                      <TableCell className="font-mono text-xs">{m.offerId}</TableCell>
                      <TableCell>{m.offerName}</TableCell>
                      <TableCell>
                        {plans?.find(p => p.id === m.internalPlanId)?.name || 'Plan no encontrado'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.active ? 'default' : 'secondary'}>{m.active ? 'Activo' : 'Inactivo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
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