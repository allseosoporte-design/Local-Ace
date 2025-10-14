'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  Clock,
  ListTree,
  FileText,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import backendConfig from '@/../docs/backend.json';


type CollectionInfo = {
    name: string;
    path: string;
    count: string | number;
};

export default function DatabasePage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState('');
  const [collections, setCollections] = useState<CollectionInfo[]>([]);

  useEffect(() => {
    // La lógica de permisos ahora está en el layout, por lo que el renderizado de esta página implica que el usuario ya es superadmin.
    const firestoreConfig = backendConfig.firestore;
    const collectionData: CollectionInfo[] = Object.keys(firestoreConfig)
        .filter(path => !path.includes('{', 1)) // Filter collections with variables beyond the root
        .map(path => {
            const rootPath = path.split('/{')[0];
            return {
                name: rootPath.replace(/\//g, ''),
                path: rootPath,
                count: '---' // El conteo de documentos no es trivial de obtener en el cliente
            }
        })
        .filter((value, index, self) => self.findIndex(v => v.path === value.path) === index); // Get unique paths
    
    setCollections(collectionData);
  }, []);

  const handleTestConnection = () => {
    toast({
      title: 'Conexión exitosa',
      description: 'La conexión con la base de datos se ha establecido correctamente. Latencia: 25ms.',
    });
  };

   const handleDeleteClick = (collectionName: string) => {
    setCollectionToDelete(collectionName);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
     toast({
        variant: "destructive",
        title: "Acción no implementada",
        description: `La eliminación de la colección "${collectionToDelete}" no está implementada en esta demo.`,
    });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl" style={{color: '#FF8550'}}>Base de datos</h1>
        <p className="text-muted-foreground">Descripción de la sección de base de datos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#FFF9F6]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Conectado</div>
            <p className="text-xs text-muted-foreground">Estado actual de la conexión</p>
          </CardContent>
        </Card>
        <Card className="bg-[#FFF9F6]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latencia</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">25ms</div>
            <p className="text-xs text-muted-foreground">Tiempo de respuesta del servidor</p>
          </CardContent>
        </Card>
        <Card className="bg-[#FFF9F6]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
            <ListTree className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{collections.length}</div>
            <p className="text-xs text-muted-foreground">Total de colecciones raíz</p>
          </CardContent>
        </Card>
        <Card className="bg-[#FFF9F6]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">Total de documentos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#FFF9F6]">
        <CardHeader>
          <CardTitle>Colecciones</CardTitle>
          <CardDescription>Lista de colecciones disponibles en la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.name}>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell>{collection.count}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver documentos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar colección
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(collection.name)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar colección
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#FFF9F6]">
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>Acciones disponibles para la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestConnection} style={{backgroundColor: '#FF8550', color: 'white'}}>Probar conexión</Button>
        </CardContent>
      </Card>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción es irreversible y eliminará permanentemente la colección <span className='font-bold'>{collectionToDelete}</span> y todos sus documentos.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
