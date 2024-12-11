import * as XLSX from "xlsx";
import { Record, Config } from "./transformer/types";
import {
  DEFAULT_ABSTRACT_TYPE,
  validateTransferRecords,
} from "./transformer/transformer";

function main() {
  const inputFilePath = "./assets/xls/origin.xls";
  const outputFilePath = "./assets/output/output123.xls";

  // TODO: Replace this hard-coded data with the return value of a function
  const config: Config = {
    company: "077WCX",
    abstractType: DEFAULT_ABSTRACT_TYPE,
    duplicateCode: "1",
    date: "1131211",
  };

  // TODO: Replace this hard-coded data with the return value of a function
  const records: Record[] = [
    {
      serialNum: "1",
      crDr: "DR",
      entry: {
        acctKind: "00001",
        acctNum: "000000010",
        amount: "30000",
        id: "42912964",
        name: "範例企業有限公司",
      },
    },
    {
      serialNum: "2",
      crDr: "CR",
      entry: {
        acctKind: "00001",
        acctNum: "000000027",
        amount: "10000",
        id: "R124511881",
        name: "張小英",
      },
    },
    {
      serialNum: "3",
      crDr: "CR",
      entry: {
        acctKind: "00001",
        acctNum: "000000034",
        amount: "20000",
        id: "R121250943",
        name: "林正如",
      },
    },
  ];

  readXls(inputFilePath, outputFilePath, config, records);
}

function readXls(
  inputFilePath: string,
  outputFilePath: string,
  config: Config,
  records: Record[]
) {
  try {
    // Read the XLS template file using XLSX library
    const workbook = XLSX.readFile(inputFilePath, { bookVBA: true });

    // debitTotal should be the sum of all debit entries
    // TODO: Remove this hard-coded data and replace it with the return value of a function
    const debitTotal = "100000";

    // creditTotal should be the sum of all credit entries
    // TODO: Remove this hard-coded data and replace it with the return value of a function
    const creditTotal = "100000";

    // Validation logic here
    validateTransferRecords(config, records);

    if (debitTotal !== creditTotal) {
      throw new Error("Debit and credit totals do not match");
    }

    // Add metadata to the XLS file
    // 一、填入公司名稱
    XLSX.utils.sheet_add_aoa(
      workbook.Sheets[workbook.SheetNames[0]],
      [[config.company]],
      {
        origin: "C1",
      }
    );

    // 二、填入日期
    XLSX.utils.sheet_add_aoa(
      workbook.Sheets[workbook.SheetNames[0]],
      [[config.date]],
      {
        origin: "C3",
      }
    );

    // 三、填入借方總金額
    XLSX.utils.sheet_add_aoa(
      workbook.Sheets[workbook.SheetNames[0]],
      [[debitTotal]],
      {
        origin: "E2",
      }
    );

    // 四、填入貸方總金額
    XLSX.utils.sheet_add_aoa(
      workbook.Sheets[workbook.SheetNames[0]],
      [[creditTotal]],
      {
        origin: "E3",
      }
    );

    // Add the records to the XLS file
    const rows = records.map((record, index) => [
      (index + 1).toString(),
      record.entry.acctKind,
      record.entry.acctNum,
      record.crDr,
      record.entry.amount,
      record.entry.id,
      record.entry.name,
    ]);

    XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], rows, {
      origin: "A5",
    });

    // 六、填入結束列
    XLSX.utils.sheet_add_aoa(
      workbook.Sheets[workbook.SheetNames[0]],
      [[11111]],
      {
        origin: `${"A" + (5 + records.length)}`,
      }
    );

    XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [["*"]], {
      origin: `${"F" + (5 + records.length)}`,
    });

    // Save the workbook as an XLS (Excel 97-2003 format)
    XLSX.writeFile(workbook, outputFilePath, { bookVBA: true });

    console.log(`Conversion successful! File saved as ${outputFilePath}`);
  } catch (error) {
    console.error("Error during conversion:", error);
  }
}

// Usage
main();
