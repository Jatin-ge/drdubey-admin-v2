"use client";

import { useState } from "react";
import NewDashboard from "./NewDashboard";

export default function DashboardToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"new" | "legacy">("new");

  return (
    <div>
      {/* Toggle Bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">
          Dashboard view:
        </span>
        <div className="flex bg-gray-200 rounded-lg p-0.5">
          {(["new", "legacy"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "new" ? "New Dashboard" : "Legacy View"}
            </button>
          ))}
        </div>
        {view === "new" && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            Live data
          </span>
        )}
      </div>

      {/* Dashboard Content */}
      {view === "new" ? <NewDashboard /> : children}
    </div>
  );
}
