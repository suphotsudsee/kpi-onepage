import { PrismaClient, ProjectStatus } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Make the seed idempotent for repeated runs.
  await prisma.kPI.deleteMany();
  await prisma.project.deleteMany();

  const p1 = await prisma.project.create({
    data: {
      code: "PJ-001",
      name: "พัฒนาระบบติดตาม KPI หน่วยงาน",
      ownerName: "ทีมแผนงาน",
      department: "สำนักงานสาธารณสุข",
      fiscalYear: 2569,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-09-30"),
      status: ProjectStatus.ON_TRACK,
      progress: 62,
      budget: 350000,
      objective: "สร้าง Dashboard มาตรฐานสำหรับติดตาม KPI และโครงการ",
      targetGroup: "ผู้บริหาร/หัวหน้ากลุ่มงาน",
      outcomes: "มองภาพรวมได้เร็ว ลดงานสรุปรายงานซ้ำซ้อน",
      risks: "ข้อมูลกระจัดกระจาย/ไม่อัปเดต",
      mitigation: "กำหนดเจ้าของข้อมูล + รอบอัปเดตรายเดือน",
      timelineNote: "Q1 ออกแบบ, Q2 พัฒนา, Q3 Pilot, Q4 ใช้งานจริง",
      kpis: {
        create: [
          { name: "% โครงการปิดตามแผน", unit: "%", target: 80, actual: 65, weight: 2 },
          { name: "จำนวนรายงานอัตโนมัติ", unit: "ฉบับ", target: 12, actual: 6, weight: 1 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      code: "PJ-002",
      name: "ยกระดับคุณภาพข้อมูลรายงาน",
      ownerName: "ทีมข้อมูล",
      department: "สำนักงานสาธารณสุข",
      fiscalYear: 2569,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-06-30"),
      status: ProjectStatus.AT_RISK,
      progress: 35,
      budget: 180000,
      kpis: { create: [{ name: "ความครบถ้วนข้อมูล", unit: "%", target: 95, actual: 78, weight: 2 }] },
    },
  });

  console.log("Seeded:", p1.id);
}

main().finally(() => prisma.$disconnect());
