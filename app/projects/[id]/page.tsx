import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";
import DeleteButton from "./DeleteButton";

export default async function ProjectOnePage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();
  const p = await db.project.findUnique({
    where: { id },
    include: { kpis: true },
  });
  if (!p) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-fuchsia-50 to-amber-100 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-white/70 transition hover:-translate-y-0.5"
          >
            ← กลับ Dashboard
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/projects/${p.id}/edit`}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110"
            >
              แก้ไข
            </Link>
            <form
              action={async () => {
                "use server";
                await db.project.deleteMany({ where: { id: p.id } });
              }}
            >
              <DeleteButton />
            </form>
            <PrintButton />
          </div>
        </div>

        <div className="rounded-2xl bg-white/85 p-6 shadow-lg ring-1 ring-white/70 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Project One Page
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">{p.name}</h1>
              <p className="text-sm text-slate-600">
                รหัส: {p.code ?? "-"} • ปีงบประมาณ: {p.fiscalYear} • หน่วยงาน: {p.department}
              </p>
              <p className="text-sm text-slate-600">ผู้รับผิดชอบ: {p.ownerName}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-3 text-right text-white shadow-md">
              <div className="text-xs text-white/80">สถานะ</div>
              <div className="text-lg font-semibold">{p.status}</div>
              <div className="mt-2 text-xs text-white/80">ความคืบหน้า</div>
              <div className="text-2xl font-bold">{p.progress}%</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Block title="วัตถุประสงค์" value={p.objective} />
            <Block title="กลุ่มเป้าหมาย" value={p.targetGroup} />
            <Block title="ผลลัพธ์ที่คาดหวัง" value={p.outcomes} />
            <Block
              title="กรอบเวลา"
              value={`${p.startDate.toDateString()} → ${p.endDate.toDateString()}${
                p.timelineNote ? `\n${p.timelineNote}` : ""
              }`}
            />
            <Block title="งบประมาณ" value={`${p.budget.toLocaleString()} บาท`} />
            <Block title="ความเสี่ยง/อุปสรรค" value={p.risks} />
            <Block title="แผนจัดการความเสี่ยง" value={p.mitigation} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="mb-2 font-semibold text-slate-800">Gantt Chart</h2>
              <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Timeline
              </span>
            </div>
            <GanttChart
              fiscalYear={p.fiscalYear}
              startDate={p.startDate}
              endDate={p.endDate}
              progress={p.progress}
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="mb-2 font-semibold text-slate-800">KPI / ตัวชี้วัด</h2>
              <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                KPI
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-sky-100 via-fuchsia-100 to-amber-100 text-slate-700">
                  <tr>
                    <th className="p-2 text-left">ตัวชี้วัด</th>
                    <th className="p-2 text-right">เป้าหมาย</th>
                    <th className="p-2 text-right">ผลงาน</th>
                    <th className="p-2 text-right">หน่วย</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {p.kpis.map((k, idx) => (
                    <tr
                      key={k.id}
                      className={`border-t border-slate-100 ${idx % 2 === 0 ? "bg-white/70" : "bg-sky-50/50"}`}
                    >
                      <td className="p-2">{k.name}</td>
                      <td className="p-2 text-right">{k.target}</td>
                      <td className="p-2 text-right">
                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {k.actual}
                        </span>
                      </td>
                      <td className="p-2 text-right">{k.unit ?? "-"}</td>
                    </tr>
                  ))}
                  {p.kpis.length === 0 && (
                    <tr className="border-t border-slate-100 bg-white/70">
                      <td className="p-3 text-slate-600" colSpan={4}>
                        ยังไม่มี KPI
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">อัปเดตล่าสุด: {p.updatedAt.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, value }: { title: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/85 p-3 shadow-sm">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{value?.trim() || "-"}</div>
    </div>
  );
}

function GanttChart({
  fiscalYear,
  startDate,
  endDate,
  progress,
}: {
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  progress: number;
}) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rangeStart = new Date(fiscalYear, 0, 1);
  const rangeEnd = new Date(fiscalYear, 11, 31, 23, 59, 59, 999);
  const totalMs = rangeEnd.getTime() - rangeStart.getTime();

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs || totalMs <= 0) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
        ไม่สามารถแสดง Gantt chart ได้ (ตรวจสอบวันที่เริ่มต้น/สิ้นสุด)
      </div>
    );
  }

  const clamp = (value: number) => Math.min(Math.max(value, rangeStart.getTime()), rangeEnd.getTime());
  const clampedStart = clamp(startMs);
  const clampedEnd = clamp(endMs);
  const leftPct = ((clampedStart - rangeStart.getTime()) / totalMs) * 100;
  const rightPct = ((clampedEnd - rangeStart.getTime()) / totalMs) * 100;
  const widthPct = Math.max(rightPct - leftPct, 1.5);
  const progressWidthPct = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
      <div className="grid grid-cols-12 gap-1 text-[11px] font-semibold text-slate-500">
        {months.map((m) => (
          <div key={m} className="text-center">
            {m}
          </div>
        ))}
      </div>
      <div className="relative mt-2 h-6 rounded-full bg-slate-100">
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-sm"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        >
          <div
            className="h-full rounded-full bg-black/20"
            style={{ width: `${progressWidthPct}%` }}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-600">
        ช่วงเวลา: {startDate.toDateString()} → {endDate.toDateString()} • ความคืบหน้า {progress}%
      </div>
    </div>
  );
}
