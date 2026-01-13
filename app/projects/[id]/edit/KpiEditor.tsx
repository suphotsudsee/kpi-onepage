"use client";

import { useMemo, useState } from "react";

type KpiRow = {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  weight: number;
  isNew?: boolean;
};

export default function KpiEditor({
  kpis,
}: {
  kpis: { id: string; name: string; target: number; actual: number; unit: string | null; weight: number }[];
}) {
  const initialRows = useMemo<KpiRow[]>(
    () =>
      [
        ...kpis.map((k) => ({
          id: k.id,
          name: k.name,
          target: k.target,
          actual: k.actual,
          unit: k.unit ?? "",
          weight: k.weight,
        })),
        { id: "", name: "", target: 0, actual: 0, unit: "", weight: 1, isNew: true },
      ] as KpiRow[],
    [kpis],
  );
  const [rows, setRows] = useState<KpiRow[]>(initialRows);

  return (
    <>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">KPI / ตัวชี้วัด</h2>
          <p className="text-sm text-slate-600">แก้ไข เพิ่ม หรือทำเครื่องหมายเพื่อลบ KPI</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { id: "", name: "", target: 0, actual: 0, unit: "", weight: 1, isNew: true },
            ])
          }
          className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110"
        >
          + เพิ่มแถว KPI
        </button>
      </div>

      <input type="hidden" name="kpiRows" value={rows.length} />
      {rows.map((row, index) => (
        <div key={`${row.id || "new"}-${index}`} className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm md:col-span-2">
          <input type="hidden" name={`kpi_id_${index}`} value={row.id} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <label className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-slate-600">
                {row.isNew ? "ตัวชี้วัด (ใหม่)" : "ตัวชี้วัด"}
              </div>
              <input
                name={`kpi_name_${index}`}
                defaultValue={row.name}
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <label>
              <div className="mb-1 text-xs font-semibold text-slate-600">เป้าหมาย</div>
              <input
                name={`kpi_target_${index}`}
                type="number"
                defaultValue={row.target}
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <label>
              <div className="mb-1 text-xs font-semibold text-slate-600">ผลงาน</div>
              <input
                name={`kpi_actual_${index}`}
                type="number"
                defaultValue={row.actual}
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <label>
              <div className="mb-1 text-xs font-semibold text-slate-600">หน่วย</div>
              <input
                name={`kpi_unit_${index}`}
                defaultValue={row.unit}
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <label>
              <div className="mb-1 text-xs font-semibold text-slate-600">น้ำหนัก</div>
              <input
                name={`kpi_weight_${index}`}
                type="number"
                defaultValue={row.weight}
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2">
                <input
                  name={`kpi_delete_${index}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                />
                <span className="text-xs font-semibold text-rose-600">ลบ</span>
              </label>
              {row.isNew && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  className="text-xs font-semibold text-slate-500 underline"
                >
                  เอาแถวนี้ออก
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
