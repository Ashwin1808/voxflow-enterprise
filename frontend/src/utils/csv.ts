import type { FraudContactInput } from "../types/fraud";

export type CsvParseResult = {
  rows: FraudContactInput[];
  errors: string[];
};

const REQUIRED_HEADERS = ["customerPhone", "cardLastFour", "merchant", "amount"];

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseFraudCsv(content: string): CsvParseResult {
  const errors: string[] = [];
  const rows: FraudContactInput[] = [];
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows, errors: ["CSV must contain a header row and at least one contact"] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  for (const required of REQUIRED_HEADERS) {
    if (!header.includes(required.toLowerCase())) {
      return {
        rows,
        errors: [`Missing required column "${required}". Expected: ${REQUIRED_HEADERS.join(", ")}`],
      };
    }
  }

  lines.slice(1).forEach((line, index) => {
    const cells = splitCsvLine(line);
    const rowNumber = index + 2;

    const get = (name: string) => cells[header.indexOf(name.toLowerCase())] ?? "";

    const phone = get("customerPhone").replace(/[\s+()-]/g, "");
    const card = get("cardLastFour");
    const merchant = get("merchant");
    const amount = Number(get("amount"));

    if (!/^[0-9]{10,15}$/.test(phone)) {
      errors.push(`Row ${rowNumber}: invalid phone "${get("customerPhone")}"`);
      return;
    }
    if (!/^[0-9]{4}$/.test(card)) {
      errors.push(`Row ${rowNumber}: cardLastFour must be 4 digits, got "${get("cardLastFour")}"`);
      return;
    }
    if (!merchant) {
      errors.push(`Row ${rowNumber}: merchant is required`);
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Row ${rowNumber}: amount must be a positive number, got "${get("amount")}"`);
      return;
    }

    rows.push({ customerPhone: phone, cardLastFour: card, merchant, amount });
  });

  return { rows, errors };
}
