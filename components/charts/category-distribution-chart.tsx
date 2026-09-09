"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Product } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

export interface CategoryDistributionChartProps {
  products: Product[];
}

const COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#64748B"];

export function CategoryDistributionChart({ products }: CategoryDistributionChartProps) {
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const gradeCounts = products.reduce((acc, p) => {
    acc[p.grade] = (acc[p.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-zinc-800 bg-zinc-900/90">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Distribusi Stok & Kategori
          </CardTitle>
          <CardDescription>Komposisi kategori pakaian thrift dalam inventaris</CardDescription>
        </div>
      </CardHeader>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
        <div className="h-52 w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} pcs`, "Jumlah Stok"]}
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown details */}
        <div className="w-full sm:w-1/2 space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <p className="font-semibold text-zinc-400 uppercase text-[10px]">Rasio Grade Sortir</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold">Grade A (Istimewa)</span>
              <span className="font-extrabold text-white">{gradeCounts["GRADE_A"] || 0} pcs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-400 font-bold">Grade B (Standar)</span>
              <span className="font-extrabold text-white">{gradeCounts["GRADE_B"] || 0} pcs</span>
            </div>
          </div>

          <div className="space-y-1">
            {data.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-white">{item.value} pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
