'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Overview } from '@/components/overview';
import { RecentReviews } from '@/components/recent-reviews';
import {
  Activity,
  Phone,
  MapPin,
  Globe,
  BarChart,
  Circle,
  AreaChart,
  Printer,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();
  const [chartType, setChartType] = useState<'Barra' | 'Círculo' | 'Línea'>('Barra');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'La descarga de PDF estará disponible próximamente.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visitas al Perfil
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas Recibidas</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes de Ruta</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">
              +19% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics al Sitio Web</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +32% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold tracking-tight mb-3">
              Resumen General
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={chartType === 'Barra' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('Barra')}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Barra
              </Button>
              <Button
                variant={chartType === 'Círculo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('Círculo')}
              >
                <Circle className="h-4 w-4 mr-2" />
                Círculo
              </Button>
              <Button
                variant={chartType === 'Línea' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('Línea')}
              >
                <AreaChart className="h-4 w-4 mr-2" />
                Línea
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <FileDown className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Overview type={chartType} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Reseñas Recientes de 5 Estrellas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Obtuviste 26 nuevas reseñas de 5 estrellas este mes.
            </p>
          </CardHeader>
          <CardContent>
            <RecentReviews />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
