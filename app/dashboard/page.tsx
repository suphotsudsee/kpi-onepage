import { db } from "@/lib/db";
import Link from "next/link";
import DashboardCharts from "./ui/DashboardCharts";

function pct(n: number, d: number) {
  if (d === 0) return 0;
  return Math.round((n / d) * 100);
}

export default async function DashboardPage() {
  const projects = await db.project.findMany({
    include: { kpis: true },
    orderBy: { updatedAt: "desc" },
  });

  const total = projects.length;
  const done = projects.filter((p) => p.status === "DONE").length;
  const delayed = projects.filter((p) => p.status === "DELAYED").length;
  const atRisk = projects.filter((p) => p.status === "AT_RISK").length;
  const onTrack = projects.filter((p) => p.status === "ON_TRACK").length;

  const avgProgress = total
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / total)
    : 0;

  const cards = [
    { label: "โครงการทั้งหมด", value: total, tone: "from-sky-500 to-blue-600" },
    { label: "ความคืบหน้าเฉลี่ย", value: `${avgProgress}%`, tone: "from-emerald-500 to-teal-600" },
    { label: "สำเร็จ", value: `${done} (${pct(done, total)}%)`, tone: "from-violet-500 to-fuchsia-600" },
    { label: "เสี่ยง/ล่าช้า", value: `${atRisk + delayed}`, tone: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
              KPI Dashboard
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">ภาพรวมโครงการและตัวชี้วัด</h1>
            <p className="text-sm text-slate-600">Template มาตรฐานสำหรับทุกโครงการในหน่วยงาน</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-white/70 transition hover:-translate-y-0.5"
              href="/projects/import"
            >
              นำเข้า PDF
            </Link>
            <Link
              className="rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-2 text-white shadow-lg shadow-slate-900/20"
              href="/projects/new"
            >
              + เพิ่มโครงการ
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-white/60 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm text-slate-600">{c.label}</div>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.tone}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{c.value}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-white/60 backdrop-blur">
            <h2 className="mb-3 font-semibold text-slate-800">สัดส่วนสถานะโครงการ</h2>
            <DashboardCharts
              statusData={[
                { name: "On track", value: onTrack },
                { name: "At risk", value: atRisk },
                { name: "Delayed", value: delayed },
                { name: "Done", value: done },
              ]}
              progressData={projects.map((p) => ({
                name: p.code ?? p.name.slice(0, 8),
                progress: p.progress,
              }))}
            />
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-white/60 backdrop-blur">
            <h2 className="mb-3 font-semibold text-slate-800">รายการโครงการล่าสุด</h2>
            <div className="space-y-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block rounded-xl border border-slate-100 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-sm text-slate-600">
                        {p.department} • ผู้รับผิดชอบ: {p.ownerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{p.progress}%</div>
                      <div className="text-xs text-slate-600">{p.status}</div>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-slate-600">ยังไม่มีโครงการ (กด “เพิ่มโครงการ”)</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
