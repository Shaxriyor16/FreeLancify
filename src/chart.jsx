import React from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "<$500", bids: 4, fill: "#818cf8" },
  { name: "$500-1k", bids: 12, fill: "#6366f1" },
  { name: "$1k-2k", bids: 25, fill: "#4f46e5" },
  { name: "$2k-5k", bids: 15, fill: "#4338ca" },
  { name: ">$5k", bids: 3, fill: "#3730a3" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        <p className="text-xs text-primary dark:text-primary-400 font-medium">
          {payload[0].value} active bids
        </p>
      </div>
    );
  }
  return null;
};

export const BidDistributionChart = () => {
  return (
    <div className="w-full h-full p-4 relative flex flex-col">
      <div className="absolute top-4 right-4 text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
          Competition Level
        </p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          High (59 Bids)
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 40, right: 20, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            className="dark:opacity-20"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="bids" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

let root = null;
export function renderBidChart() {
  const container = document.getElementById("project-bid-chart-root");
  if (container) {
    if (!root) {
      root = createRoot(container);
    }
    // Small timeout to allow the browser to calculate dimensions after display block
    setTimeout(() => {
      root.render(<BidDistributionChart />);
    }, 50);
  }
}
