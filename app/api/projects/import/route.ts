import { db } from "@/lib/db";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headings = [
  "วัตถุประสงค์",
  "กลุ่มเป้าหมาย",
  "เป้าหมายของโครงการ",
  "วิธีการดำเนินการ",
  "ระยะเวลาดำเนินการ",
  "สถานที่ดำเนินการ",
  "ผู้รับผิดชอบโครงการ",
  "งบประมาณ",
  "ผลที่คาดว่าจะได้รับ",
  "ความเสี่ยง",
  "แผนจัดการความเสี่ยง",
  "ลงชื่อ",
];

const thaiMonths: Record<string, number> = {
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
};

function normalizeText(text: string) {
  return text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
}

function extractSection(text: string, start: string) {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return "";
  const after = text.slice(startIndex + start.length);
  let endIndex = after.length;
  for (const h of headings) {
    if (h === start) continue;
    const idx = after.indexOf(h);
    if (idx !== -1 && idx < endIndex) endIndex = idx;
  }
  return after.slice(0, endIndex).trim();
}

function extractLine(text: string, label: string) {
  const match = text.match(new RegExp(`${label}\\s*([^\\n]+)`));
  return match?.[1]?.trim() ?? "";
}

function thaiYearToGregorian(year: number) {
  return year > 2400 ? year - 543 : year;
}

function parseTimelineDates(text: string) {
  const line = extractLine(text, "ระยะเวลาดำเนินการ");
  const matches = [...line.matchAll(/เดือน\s*([ก-๙]+)\s*พ\.ศ\.\s*(\d{4})/g)];
  if (matches.length >= 2) {
    const [startMonthName, startYearRaw] = [matches[0][1], Number(matches[0][2])];
    const [endMonthName, endYearRaw] = [matches[1][1], Number(matches[1][2])];
    const startMonth = thaiMonths[startMonthName];
    const endMonth = thaiMonths[endMonthName];
    if (startMonth && endMonth) {
      const startYear = thaiYearToGregorian(startYearRaw);
      const endYear = thaiYearToGregorian(endYearRaw);
      const startDate = new Date(startYear, startMonth - 1, 1);
      const endDate = new Date(endYear, endMonth, 0);
      return { startDate, endDate, timelineLine: line };
    }
  }

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 6);
  return { startDate: now, endDate: end, timelineLine: line };
}

function parseBudget(text: string) {
  const matches = [...text.matchAll(/รวมเป็นเงิน(?:ทั้งสิ้น)?\s*([0-9,]+)/g)];
  const last = matches.at(-1)?.[1];
  return last ? Number(last.replace(/,/g, "")) : 0;
}

function parseProjectName(text: string) {
  const match = text.match(/โครงการ\s+([^\n]+?)\s+ปีงบประมาณ/);
  if (match?.[1]) return match[1].trim();
  const fallback = text.match(/โครงการ\s+([^\n]+)/);
  return fallback?.[1]?.trim() ?? "";
}

function parseDepartment(text: string) {
  const line = extractLine(text, "สถานที่ดำเนินการ");
  if (line) return line;
  const match = text.match(/สำนักงานสาธารณสุขจังหวัด[^\n]+/);
  return match?.[0]?.trim() ?? "";
}

function parseOwnerName(text: string) {
  const line = extractLine(text, "ผู้รับผิดชอบโครงการ");
  if (line) return line;
  const match = text.match(/หัวหน้ากลุ่มงาน[^\n]+/);
  return match?.[0]?.trim() ?? "";
}

function parseFiscalYear(text: string) {
  const match = text.match(/ปีงบประมาณ\s*(\d{4})/);
  if (match?.[1]) return Number(match[1]);
  const now = new Date();
  return now.getFullYear() + 543;
}

async function parsePdfText(buffer: ArrayBuffer) {
  const tempPath = path.join(
    os.tmpdir(),
    `kpi-import-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`,
  );
  await fs.writeFile(tempPath, Buffer.from(buffer));

  const nodeScript = `
    const fs = require("fs");
    const { PDFParse } = require("pdf-parse");
    const data = fs.readFileSync(process.argv[1]);
    const parser = new PDFParse({ data, disableWorker: true });
    parser.getText().then(r => process.stdout.write(r.text || "")).catch(err => {
      console.error(err);
      process.exit(1);
    });
  `;

  try {
    const text = await new Promise<string>((resolve, reject) => {
      execFile(
        process.execPath,
        ["-e", nodeScript, tempPath],
        { maxBuffer: 8 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
            return;
          }
          resolve(stdout);
        },
      );
    });
    return text;
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const rawText = await parsePdfText(buffer);
    const text = normalizeText(rawText);

    const name = parseProjectName(text) || file.name.replace(/\.pdf$/i, "") || "โครงการใหม่";
    const department = parseDepartment(text) || "ไม่ระบุ";
    const ownerName = parseOwnerName(text) || "ไม่ระบุ";
    const fiscalYear = parseFiscalYear(text);
    const objective = extractSection(text, "วัตถุประสงค์");
    const targetGroup = extractSection(text, "กลุ่มเป้าหมาย");
    const outcomes = extractSection(text, "ผลที่คาดว่าจะได้รับ");
    const risks = extractSection(text, "ความเสี่ยง");
    const mitigation = extractSection(text, "แผนจัดการความเสี่ยง");
    const method = extractSection(text, "วิธีการดำเนินการ");
    const { startDate, endDate, timelineLine } = parseTimelineDates(text);
    const budget = parseBudget(text);

    const timelineNote = [timelineLine, method].filter(Boolean).join("\n");

    const p = await db.project.create({
      data: {
        name,
        ownerName,
        department,
        fiscalYear,
        startDate,
        endDate,
        objective: objective || null,
        targetGroup: targetGroup || null,
        outcomes: outcomes || null,
        risks: risks || null,
        mitigation: mitigation || null,
        timelineNote: timelineNote || null,
        budget,
        progress: 0,
      },
    });

    return NextResponse.redirect(new URL(`/projects/${p.id}`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
