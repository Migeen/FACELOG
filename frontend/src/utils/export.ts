
import * as XLSX from "xlsx";

export function exportToExcel(data: any[], fileName: string = "export.xlsx", sheetName = "Sheet1") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
}
