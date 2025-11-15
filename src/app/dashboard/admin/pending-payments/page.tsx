
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getIdTokenResult } from 'firebase/auth';

interface PendingPayment {
  id: string;
  empresaNombre: string;
  empresaId: string;
  planSolicitado: string;
  fechaSolicitud: Timestamp;
  estadoPago: 'pendiente' | 'aprobado' | 'rechazado';
}

export default function PendingPaymentsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user && firestore) {
        try {
          const tokenResult = await getIdTokenResult(user, true);
          const claims = tokenResult.claims;
          if (claims.isSuperAdmin === true) {
            setIsSuperAdmin(true);
          }
        } catch (error) {
          console.error("Error fetching token claims:", error);
          setIsSuperAdmin(false);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else if (!isUserLoading) {
        setIsCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [user, isUserLoading, firestore]);

  const paymentsQuery = useMemo(() => {
    if (isCheckingAdmin || !isSuperAdmin || !firestore) return null;
    return query(
      collection(firestore, 'pendingPayments'),
      where('estadoPago', '==', 'pendiente'),
      orderBy('fechaSolicitud', 'desc')
    );
  }, [firestore, isSuperAdmin, isCheckingAdmin]);

  const { data: payments, isLoading: isLoadingPayments, error, forceUpdate } = useCollection<PendingPayment>(paymentsQuery);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(
      (p) =>
        p.empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.empresaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.planSolicitado.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  const handleUpdateStatus = useCallback(
    async (paymentId: string, newStatus: 'aprobado' | 'rechazado', payment: PendingPayment) => {
      if (!firestore || !user) return;
      setIsUpdating(paymentId);
      try {
        const batch = writeBatch(firestore);
        
        const paymentRef = doc(firestore, 'pendingPayments', paymentId);
        batch.update(paymentRef, { 
          estadoPago: newStatus,
          idAdminRevisor: user.uid,
          fechaRevision: serverTimestamp() 
        });

        if (newStatus === 'aprobado') {
          const subscriptionRef = doc(collection(firestore, 'subscriptions'));
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + 30);
          
          batch.set(subscriptionRef, {
            empresaId: payment.empresaId,
            planActivo: payment.planSolicitado,
            fechaInicio: serverTimestamp(),
            fechaVencimiento: Timestamp.fromDate(endDate),
            paymentId: paymentId
          });

          // In a real app, you would have a more robust logging system.
          // For now, we'll log to a simple collection.
          const logRef = doc(collection(firestore, 'globalAuditLogs'));
          batch.set(logRef, {
            entity: 'pendingPayments',
            entityId: paymentId,
            action: 'updated',
            performedBy: { uid: user.uid, email: user.email },
            timestamp: serverTimestamp(),
            details: `Payment status for ${payment.empresaNombre} changed to ${newStatus}.`,
            newData: { estadoPago: newStatus },
            previousData: { estadoPago: 'pendiente' }
          });
        }
        
        await batch.commit();
        
        toast({
          title: `Pago ${newStatus === 'aprobado' ? 'Aprobado' : 'Rechazado'}`,
          description: `El pago para ${payment.empresaNombre} ha sido ${newStatus === 'aprobado' ? 'aprobado' : 'rechazado'}.`,
        });

      } catch (e) {
        console.error('Error updating payment status:', e);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo actualizar el estado del pago.',
        });
      } finally {
        setIsUpdating(null);
      }
    },
    [firestore, user, toast]
  );
  
  const refreshData = () => {
    if (forceUpdate) {
        forceUpdate();
    }
    toast({ title: "Datos actualizados", description: "Se han recargado los pagos pendientes."})
  }
  
  const isLoading = isUserLoading || isCheckingAdmin || (paymentsQuery !== null && isLoadingPayments);

  if (!isCheckingAdmin && !isSuperAdmin) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
                <CardDescription>No tienes permisos para ver esta sección.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Gestión de Pagos Pendientes
        </h1>
        <p className="text-muted-foreground">
          Verifica y aprueba las suscripciones pagadas por transferencia.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos por Verificar</CardTitle>
          <CardDescription>
            Lista de empresas que han notificado un pago y esperan activación manual.
          </CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de empresa, plan..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plan Solicitado</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No hay pagos pendientes.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.empresaNombre}</div>
                      <div className="text-sm text-muted-foreground">{payment.empresaId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.planSolicitado}</Badge>
                    </TableCell>
                    <TableCell>
                      {payment.fechaSolicitud
                        ? format(payment.fechaSolicitud.toDate(), 'dd/MM/yyyy HH:mm', {locale: es})
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {isUpdating === payment.id ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleUpdateStatus(payment.id, 'aprobado', payment)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleUpdateStatus(payment.id, 'rechazado', payment)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
