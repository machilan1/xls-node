"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const transformer_1 = require("./transformer/transformer");
function readXls(inputFilePath, outputFilePath, config, records) {
    return __awaiter(this, void 0, void 0, function* () {
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
            (0, transformer_1.validateTransferRecords)(config, records);
            if (debitTotal !== creditTotal) {
                throw new Error("Debit and credit totals do not match");
            }
            // Add metadata to the XLS file
            // 一、填入公司名稱
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [[config.company]], {
                origin: "C1",
            });
            // 二、填入日期
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [[config.date]], {
                origin: "C3",
            });
            // 三、填入借方總金額
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [[debitTotal]], {
                origin: "E2",
            });
            // 四、填入貸方總金額
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [[creditTotal]], {
                origin: "E3",
            });
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
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [[11111]], {
                origin: `${"A" + (5 + records.length)}`,
            });
            XLSX.utils.sheet_add_aoa(workbook.Sheets[workbook.SheetNames[0]], [["*"]], {
                origin: `${"F" + (5 + records.length)}`,
            });
            // Save the workbook as an XLS (Excel 97-2003 format)
            XLSX.writeFile(workbook, outputFilePath, { bookVBA: true });
            console.log(`Conversion successful! File saved as ${outputFilePath}`);
        }
        catch (error) {
            console.error("Error during conversion:", error);
        }
    });
}
// Usage
const inputFilePath = "./assets/xls/origin.xls";
const outputFilePath = "./assets/output/output123.xls";
const config = {
    company: "077WCX",
    abstractType: transformer_1.DEFAULT_ABSTRACT_TYPE,
    duplicateCode: "1",
    date: "1131211",
};
const records = [
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
