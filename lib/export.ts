// Zero-dependency CSV + XLS (Excel) export.
// XLS uses the SpreadsheetML 2003 XML format which Excel/Numbers/Sheets open natively.

export type Cell = string | number | null | undefined;
export type Row = Cell[];

export interface Sheet {
  name: string;
  rows: Row[]; // first row is treated as the header
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(v: Cell): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCSV(rows: Row[], filename: string) {
  const text = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  // BOM so Excel reads UTF-8 correctly
  download(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8;" }), filename);
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cellXml(v: Cell): string {
  if (v === null || v === undefined || v === "") {
    return '<Cell><Data ss:Type="String"></Data></Cell>';
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return `<Cell><Data ss:Type="Number">${v}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(String(v))}</Data></Cell>`;
}

export function exportXLS(sheets: Sheet[], filename: string) {
  const worksheets = sheets
    .map((sheet) => {
      const rows = sheet.rows
        .map((row, i) => {
          const cells = row.map(cellXml).join("");
          // bold header row via styles below
          return `<Row${i === 0 ? ' ss:StyleID="hdr"' : ""}>${cells}</Row>`;
        })
        .join("");
      return `<Worksheet ss:Name="${xmlEscape(sheet.name).slice(0, 31)}"><Table>${rows}</Table></Worksheet>`;
    })
    .join("");

  const xml =
    '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
    '<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/>' +
    '<Interior ss:Color="#EAF2FF" ss:Pattern="Solid"/></Style></Styles>' +
    worksheets +
    "</Workbook>";

  download(
    new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    filename
  );
}

// Convenience: export a single table to both helpers
export function tableToCSV(header: string[], body: Row[], filename: string) {
  exportCSV([header, ...body], filename);
}
export function tableToXLS(name: string, header: string[], body: Row[], filename: string) {
  exportXLS([{ name, rows: [header, ...body] }], filename);
}
