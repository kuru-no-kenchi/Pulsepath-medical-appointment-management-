"use client";

import { ReactNode } from "react";

export interface Stats {
  key: string;
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
}

interface DashboardStatsProps {
  stats: Stats[];
  loading?: boolean;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
  gray: "bg-gray-100 text-gray-600",
};

export default function DashboardStats({
  stats,
  loading = false,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      {stats.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>

            {card.icon && (
              <div
                className={`p-2 rounded-lg ${
                  colorClasses[card.color ?? "blue"]
                }`}
              >
                {card.icon}
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-3 h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <h3 className="mt-3 text-3xl font-bold text-gray-800">
              {card.value}
            </h3>
          )}
        </div>
      ))}
    </div>
  );
}
