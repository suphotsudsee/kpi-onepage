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
              code={p.code}
              fiscalYear={p.fiscalYear}
              startDate={p.startDate}
              endDate={p.endDate}
              progress={p.progress}
              timelineNote={p.timelineNote}
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
  code,
  fiscalYear,
  startDate,
  endDate,
  progress,
  timelineNote,
}: {
  code?: string | null;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  progress: number;
  timelineNote?: string | null;
}) {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const rangeStart = new Date(fiscalYear - 1, 9, 1);
  const rangeEnd = new Date(fiscalYear, 8, 30, 23, 59, 59, 999);
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

  const monthIndexByName: Record<string, number> = {
    jan: 0,
    january: 0,
    "ม.ค": 0,
    มกราคม: 0,
    feb: 1,
    february: 1,
    "ก.พ": 1,
    กุมภาพันธ์: 1,
    mar: 2,
    march: 2,
    "มี.ค": 2,
    มีนาคม: 2,
    apr: 3,
    april: 3,
    "เม.ย": 3,
    เมษายน: 3,
    may: 4,
    "พ.ค": 4,
    พฤษภาคม: 4,
    jun: 5,
    june: 5,
    "มิ.ย": 5,
    มิถุนายน: 5,
    jul: 6,
    july: 6,
    "ก.ค": 6,
    กรกฎาคม: 6,
    aug: 7,
    august: 7,
    "ส.ค": 7,
    สิงหาคม: 7,
    sep: 8,
    sept: 8,
    september: 8,
    "ก.ย": 8,
    กันยายน: 8,
    oct: 9,
    october: 9,
    "ต.ค": 9,
    ตุลาคม: 9,
    nov: 10,
    november: 10,
    "พ.ย": 10,
    พฤศจิกายน: 10,
    dec: 11,
    december: 11,
    "ธ.ค": 11,
    ธันวาคม: 11,
  };

  const monthRegex =
    /(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.ค|ก\.พ|มี\.ค|เม\.ย|พ\.ค|มิ\.ย|ก\.ค|ส\.ค|ก\.ย|ต\.ค|พ\.ย|ธ\.ค|jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)/gi;

  const toFiscalPos = (monthIndex: number) => (monthIndex - 9 + 12) % 12;
  const toPctRange = (startMonthIndex: number, endMonthIndex: number) => {
    const startPos = toFiscalPos(startMonthIndex);
    const endPos = toFiscalPos(endMonthIndex) + 1;
    const safeEnd = endPos <= startPos ? startPos + 1 : endPos;
    return {
      startPct: (startPos / 12) * 100,
      widthPct: ((safeEnd - startPos) / 12) * 100,
    };
  };

  const normalizeMonthKey = (value: string) => value.toLowerCase().replace(/\.$/, "");
  const collectMonthMatches = (label: string) => {
    const matches: { monthIndex: number; pos: number }[] = [];
    for (const m of label.matchAll(monthRegex)) {
      const key = normalizeMonthKey(m[0]);
      const monthIndex = monthIndexByName[key];
      if (typeof monthIndex === "number") {
        matches.push({ monthIndex, pos: m.index ?? 0 });
      }
    }
    const numericRegex = /\b(0?[1-9]|1[0-2])\s*[\/.-]\s*(\d{2,4})\b/g;
    for (const m of label.matchAll(numericRegex)) {
      const monthIndex = Number(m[1]) - 1;
      if (monthIndex >= 0 && monthIndex <= 11) {
        matches.push({ monthIndex, pos: m.index ?? 0 });
      }
    }
    return matches.sort((a, b) => a.pos - b.pos).map((m) => m.monthIndex);
  };

  const tones = [
    "from-amber-400 to-yellow-400",
    "from-emerald-400 to-teal-500",
    "from-sky-400 to-cyan-500",
    "from-fuchsia-500 to-rose-500",
    "from-indigo-500 to-violet-600",
    "from-rose-400 to-rose-500",
  ];

  const noteTasks = String(timelineNote || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[\).\-\s]+/, "").trim())
    .filter(Boolean);

  const parsedTasks = noteTasks.map((label, idx) => {
    const qMatch = label.match(/q\s*([1-4])/i);
    if (qMatch) {
      const q = Number(qMatch[1]);
      return {
        label,
        startPct: ((q - 1) * 3 * 100) / 12,
        widthPct: (3 * 100) / 12,
        tone: tones[(q - 1) % tones.length],
        hasRange: true,
      };
    }

    const monthIndexes = collectMonthMatches(label);

    if (monthIndexes.length > 0) {
      const startIdx = monthIndexes[0];
      const endIdx = monthIndexes[monthIndexes.length - 1];
      const range = toPctRange(startIdx, endIdx);
      return {
        label,
        ...range,
        tone: tones[idx % tones.length],
        hasRange: true,
      };
    }

    return { label, tone: tones[idx % tones.length], hasRange: false };
  });

  const showQuarterHeader = parsedTasks.some((t) => /q\s*[1-4]/i.test(t.label));
  const hasTasks = parsedTasks.length > 0;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold text-slate-700">
        รหัสโครงการ: {code?.trim() || "-"}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 text-[11px] text-slate-600">
        <div className="grid grid-cols-[160px_repeat(12,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
          <div className="border-r border-slate-200 px-2 py-1">Task Name</div>
          {showQuarterHeader && (
            <>
              <div className="col-span-3 border-r border-slate-200 px-1 py-1 text-center">Q1</div>
              <div className="col-span-3 border-r border-slate-200 px-1 py-1 text-center">Q2</div>
              <div className="col-span-3 border-r border-slate-200 px-1 py-1 text-center">Q3</div>
              <div className="col-span-3 px-1 py-1 text-center">Q4</div>
            </>
          )}
        </div>
        <div className="grid grid-cols-[160px_repeat(12,minmax(0,1fr))] border-b border-slate-200 bg-white font-semibold text-slate-500">
          <div className="border-r border-slate-200 px-2 py-1" />
          {months.map((m, idx) => (
            <div
              key={m}
              className={`px-1 py-1 text-center ${idx !== months.length - 1 ? "border-r border-slate-100" : ""}`}
            >
              {m}
            </div>
          ))}
        </div>
        {parsedTasks.map((row, idx) => (
          <div
            key={row.label}
            className={`grid grid-cols-[160px_repeat(12,minmax(0,1fr))] bg-white ${
              idx !== parsedTasks.length - 1 ? "border-b border-slate-200" : ""
            }`}
          >
            <div className="border-r border-slate-200 px-2 py-2 text-sm font-medium text-slate-700">
              {row.label}
            </div>
            <div className="relative col-span-12 h-8">
              <div className="absolute inset-0 grid grid-cols-12">
                {months.map((m, mIdx) => (
                  <div
                    key={`${row.label}-${m}-grid`}
                    className={`h-full ${mIdx !== months.length - 1 ? "border-r border-slate-100" : ""}`}
                  />
                ))}
              </div>
              {row.hasRange && (
                <div
                  className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r ${row.tone} shadow-sm`}
                  style={{ left: `${row.startPct}%`, width: `${row.widthPct}%` }}
                />
              )}
            </div>
          </div>
        ))}
        {!hasTasks && (
          <div className="grid grid-cols-[160px_repeat(12,minmax(0,1fr))] bg-white">
            <div className="border-r border-slate-200 px-2 py-2 text-sm font-medium text-slate-700">
              โครงการ
            </div>
            <div className="relative col-span-12 h-8">
              <div className="absolute inset-0 grid grid-cols-12">
                {months.map((m, mIdx) => (
                  <div
                    key={`${m}-grid`}
                    className={`h-full ${mIdx !== months.length - 1 ? "border-r border-slate-100" : ""}`}
                  />
                ))}
              </div>
              <div
                className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-sm"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              >
                <div className="h-full rounded-full bg-black/20" style={{ width: `${progressWidthPct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-600">
        ช่วงเวลา: {startDate.toDateString()} → {endDate.toDateString()} • ความคืบหน้า {progress}%
      </div>
    </div>
  );
}
