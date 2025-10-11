"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { overviewData } from "@/lib/data"
import { ChartTooltipContent } from "@/components/ui/chart"

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={overviewData}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip cursor={{fill: 'hsl(var(--secondary))'}} content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
