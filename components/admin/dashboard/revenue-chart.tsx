"use client";

import { useState } from "react";
import { BarChart3, LineChart, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Overview } from "./overview";

interface RevenueChartProps {
  data: any[];
}

const chartColors = {
  blue: "#2563eb",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
};

export function RevenueChart({ data }: RevenueChartProps) {
  const [isBarChart, setIsBarChart] = useState(true);
  const [chartColor, setChartColor] = useState<keyof typeof chartColors>("blue");

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue breakdown</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Palette className="h-4 w-4" style={{ color: chartColors[chartColor] }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(chartColors).map(([name, color]) => (
                <DropdownMenuItem
                  key={name}
                  onClick={() => setChartColor(name as keyof typeof chartColors)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">{name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsBarChart(!isBarChart)}
          >
            {isBarChart ? (
              <LineChart className="h-4 w-4" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <Overview 
          data={data} 
          chartStyle={isBarChart ? 'bar' : 'line'}
          chartColor={chartColors[chartColor]}
        />
      </CardContent>
    </Card>
  );
} 