
'use client';

import { BarChart3, Star, Percent, MessageCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell } from "recharts"


const chartData = [
  { month: "Enero", desktop: 186 },
  { month: "Febrero", desktop: 305 },
  { month: "Marzo", desktop: 237 },
  { month: "Abril", desktop: 73 },
  { month: "Mayo", desktop: 209 },
  { month: "Junio", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Conversaciones",
    color: "hsl(var(--primary))",
  },
}

const pieChartData = [
  { name: 'IA', value: 65, color: 'hsl(var(--primary))' },
  { name: 'FAQ', value: 35, color: 'hsl(var(--accent))' },
];

const conversations = [
    { id: 1, user: 'John Doe', email: 'john.d@example.com', date: '2024-07-28', status: 'Resuelta' },
    { id: 2, user: 'Jane Smith', email: 'jane.s@example.com', date: '2024-07-28', status: 'Abierta' },
    { id: 3, user: 'Peter Jones', email: 'peter.j@example.com', date: '2024-07-27', status: 'Resuelta' },
    { id: 4, user: 'Ana García', email: 'ana.g@example.com', date: '2024-07-27', status: 'Resuelta' },
];

export default function ChatbotAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Análisis del Chatbot
        </h1>
        <p className="text-muted-foreground">
          Métricas y estadísticas de uso de tu asistente virtual.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversaciones</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">-15% desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes por Sesión</CardTitle>
             <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
             <p className="text-xs text-green-500">+2.5% esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5/5</div>
            <p className="text-xs text-muted-foreground">Basado en 250 valoraciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso de IA vs. FAQ</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">de respuestas generadas por IA</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Conversaciones por Día</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                 <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución de Respuestas</CardTitle>
             <CardDescription>Comparativa entre respuestas de la IA y las FAQs.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="min-h-[250px] w-full flex items-center justify-center">
                <PieChart>
                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                     {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                   <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
                <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Conversaciones Recientes</CardTitle>
                        <CardDescription>Visualiza las últimas interacciones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {conversations.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.user}</TableCell>
                                        <TableCell>{c.email}</TableCell>
                                        <TableCell>{c.date}</TableCell>
                                        <TableCell>
                                             <Badge variant={c.status === 'Resuelta' ? 'default' : 'secondary'}>{c.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="conversations">
                <Card>
                     <CardContent className='pt-6'>
                       <p className='text-muted-foreground text-center'>El historial detallado de conversaciones estará disponible pronto.</p>
                     </CardContent>
                </Card>
             </TabsContent>
             <TabsContent value="faq">
                <Card>
                    <CardContent className='pt-6'>
                       <p className='text-muted-foreground text-center'>El análisis de preguntas más frecuentes estará disponible pronto.</p>
                     </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
    </div>
  );
}
