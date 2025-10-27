
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { columns, type Message } from './columns';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const submissionsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `businesses/${user.uid}/contactSubmissions`),
      orderBy('submittedAt', 'desc')
    );
  }, [firestore, user]);

  const {
    data: submissions,
    isLoading: isLoadingSubmissions,
    error,
  } = useCollection<Message>(submissionsQuery);

  const isLoading = isUserLoading || isLoadingSubmissions;

  if (error) {
    console.error("Firestore error:", error);
    toast({
        variant: "destructive",
        title: "Error de base de datos",
        description: "No se pudieron cargar los mensajes. Revisa los permisos de Firestore."
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Mensajes de Contacto
        </h1>
        <p className="text-muted-foreground">
          Revisa los mensajes enviados desde tu formulario de contacto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bandeja de Entrada</CardTitle>
          <CardDescription>
            Aquí puedes ver todos los mensajes recibidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable columns={columns} data={submissions || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
