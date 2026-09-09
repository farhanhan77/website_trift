"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { BalPerformanceData } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Layers } from "lucide-react";

export interface BalPerformanceChartProps {
  data: BalPerformanceData[];
}

export function BalPerformanceChart({ data }: BalPerformanceChartProps) {
  const chartData = data.map((item) => ({
    name: item.bal_code,
    fullName: item.bal_name,
    roi: item.roi_percent,
    revenue: item.total_revenue,
    capital: item.total_capital,
    profit: item.net_profit,
    sold: `${item.items_sold}/${item.items_total} pcs`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl bg-zinc-900 border border-zinc-700/80 p-3 shadow-2xl text-xs space-y-1.5 min-w-[200px]">
          <div className="border-b border-zinc-800 pb-1.5">
            <span className="font-mono font-bold text-amber-400">{item.name}</span>
            <p className="font-bold text-white text-xs mt-0.5">{item.fullName}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Total Modal Bal:</span>
            <span className="font-mono text-zinc-200">{formatIDR(item.capital)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Omset Penjualan:</span>
            <span className="font-mono text-emerald-400 font-bold">{formatIDR(item.revenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Realisasi Laba:</span>
            <span className="font-mono text-amber-400 font-bold">{formatIDR(item.profit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Item Terjual:</span>
            <span className="font-bold text-zinc-200">{item.sold}</span>
          </div>
          <div className="pt-1.5 border-t border-zinc-800 flex justify-between items-center">
            <span className="font-bold text-zinc-300">ROI Capaian:</span>
            <span className="font-extrabold text-sm text-emerald-400">{item.roi}%</span>
          </div>
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
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Matriks Performa & ROI per Bal
          </CardTitle>
          <CardDescription>
            Persentase ROI per batch bal (Rumus: (Omset / Total Modal) x 100%)
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#232a3b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#232a3b" }}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#232a3b" }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="roi" name="ROI %" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.roi >= 100 ? "#10B981" : entry.roi >= 50 ? "#F59E0B" : "#3B82F6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
