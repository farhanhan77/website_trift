"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { MonthlyProfitData } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export interface ProfitLossChartProps {
  data: MonthlyProfitData[];
}

export function ProfitLossChart({ data }: ProfitLossChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-zinc-900 border border-zinc-700/80 p-3 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white mb-1.5 pb-1 border-b border-zinc-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">{formatIDR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/90">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Grafik Laba & Rugi Bulanan (P&L Chart)
          </CardTitle>
          <CardDescription>
            Perbandingan omset kotor, laba bersih transaksi thrift, dan biaya operasional
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232a3b" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#232a3b" }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#232a3b" }}
              tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              formatter={(value) => <span className="text-zinc-300 font-medium">{value}</span>}
            />
            <Bar dataKey="revenue" name="Omset Penjualan" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="netProfit" name="Laba Bersih" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Biaya Operasional" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
