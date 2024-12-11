import { Config, Record, Error } from "./types";

export const DEFAULT_ABSTRACT_TYPE = "24";

// Constants for error messages
const ERROR_MESSAGES = {
  INVALID_DATE: "日期格式錯誤",
  INVALID_DUPLICATE_CODE: "重複碼錯誤",
  FIRST_RECORD_DR_REQUIRED: "第一筆記錄必須為借方(DR)",
  ACCOUNT_ERROR: "帳號錯誤",
  ID_FORMAT_ERROR: "身分證字號格式錯誤",
  NEGATIVE_AMOUNT_ERROR: "金額需不得為負數",
  INVALID_CRDR: "借貸記號只能為CR或DR",
};

// TODO: CreateTransferRecords()

export function validateTransferRecords(config: Config, records: Record[]) {
  const configErrors: Error[] = [];
  const formatErrors: Error[] = [];
  const recordErrors: Error[] = [];

  config.abstractType = config.abstractType || DEFAULT_ABSTRACT_TYPE;

  // Validate config
  validateConfig(config, configErrors);
  if (configErrors.length > 0) {
    throw new Error(
      "Config validation failed: " + JSON.stringify(configErrors)
    );
  }

  //validate record format
  validateRecordFormat(records, formatErrors);
  if (formatErrors.length > 0) {
    throw new Error(
      "Record format validation failed: " + JSON.stringify(formatErrors)
    );
  }

  // Validate records
  records.forEach((record) => {
    validateRecord(record, recordErrors);
  });

  if (recordErrors.length > 0) {
    throw new Error(
      "Record validation failed: " + JSON.stringify(recordErrors)
    );
  }
}

function validateConfig(config: Config, errors: Error[]) {
  if (!validateDate(config.date)) {
    errors.push({
      target: "config.date",
      data: config.date,
      message: ERROR_MESSAGES.INVALID_DATE,
    });
  }

  if (!checkDuplicateCode(config.duplicateCode)) {
    errors.push({
      target: "config.duplicateCode",
      data: config.duplicateCode,
      message: ERROR_MESSAGES.INVALID_DUPLICATE_CODE,
    });
  }
}

function validateRecordFormat(records: Record[], errors: Error[]) {
  const firstRecord = records[0];
  if (firstRecord && firstRecord.crDr !== "DR") {
    errors.push({
      target: `record serialNum: ${firstRecord.serialNum}`,
      data: firstRecord.crDr,
      message: ERROR_MESSAGES.FIRST_RECORD_DR_REQUIRED,
    });
  }
}

function validateRecord(record: Record, errors: Error[]) {
  const { entry, crDr, serialNum } = record;

  if (!validateAccNum(entry.acctKind, entry.acctNum)) {
    errors.push({
      target: `record serialNum: ${serialNum}`,
      data: { acctKind: entry.acctKind, acctNum: entry.acctNum },
      message: ERROR_MESSAGES.ACCOUNT_ERROR,
    });
  }

  if (!validateID(entry.id)) {
    errors.push({
      target: `record serialNum: ${serialNum}`,
      data: entry.id,
      message: ERROR_MESSAGES.ID_FORMAT_ERROR,
    });
  }

  if (!validateAmount(entry.amount)) {
    errors.push({
      target: `record serialNum: ${serialNum}`,
      data: entry.amount,
      message: ERROR_MESSAGES.NEGATIVE_AMOUNT_ERROR,
    });
  }

  if (!validateCrDr(crDr)) {
    errors.push({
      target: `record serialNum: ${serialNum}`,
      data: crDr,
      message: ERROR_MESSAGES.INVALID_CRDR,
    });
  }
}

// TODO: There are some record validation not implemented yet.

function validateAccNum(acctKind: string, acctNum: string): boolean {
  acctKind = acctKind.trim();
  acctNum = acctNum.trim();

  if (acctKind === "" && acctNum === "") return true; // Skip empty account

  if (isNaN(Number(acctKind)) || isNaN(Number(acctNum))) return false;

  // Pad the account numbers with leading zeros
  acctKind = acctKind.padStart(5, "0");
  acctNum = acctNum.padStart(9, "0");

  const tmp =
    7 * Number(acctKind[0]) +
    1 * Number(acctKind[1]) +
    3 * Number(acctKind[2]) +
    1 * Number(acctKind[3]) +
    3 * Number(acctKind[4]) +
    1 * Number(acctNum[0]) +
    3 * Number(acctNum[1]) +
    7 * Number(acctNum[2]) +
    1 * Number(acctNum[3]) +
    3 * Number(acctNum[4]) +
    7 * Number(acctNum[5]) +
    3 * Number(acctNum[6]) +
    7 * Number(acctNum[7]);

  return tmp % 10 === Number(acctNum[8]);
}

function validateID(id: string): boolean {
  if (id === "" || id === "*") return true; // Skip empty ID and ignore *

  // 驗證台灣身分證字號
  const idRegex = /^[A-Z][1-2]\d{8}$/;
  if (idRegex.test(id)) {
    // 英文字母對應的數值表
    const letterMap = {
      A: 10,
      B: 11,
      C: 12,
      D: 13,
      E: 14,
      F: 15,
      G: 16,
      H: 17,
      I: 34,
      J: 18,
      K: 19,
      L: 20,
      M: 21,
      N: 22,
      O: 35,
      P: 23,
      Q: 24,
      R: 25,
      S: 26,
      T: 27,
      U: 28,
      V: 29,
      W: 32,
      X: 30,
      Y: 31,
      Z: 33,
    };

    // 取出第一個字母與其對應的數值
    const letter = id[0] as keyof typeof letterMap;
    const letterValue = letterMap[letter];

    if (!letterValue) {
      return false;
    }

    // 計算驗證碼
    const idNumbers = id.slice(1).split("").map(Number);
    const checkSum =
      Math.floor(letterValue / 10) + // 字母數值的十位數
      (letterValue % 10) * 9 + // 字母數值的個位數乘以 9
      idNumbers[0] * 8 +
      idNumbers[1] * 7 +
      idNumbers[2] * 6 +
      idNumbers[3] * 5 +
      idNumbers[4] * 4 +
      idNumbers[5] * 3 +
      idNumbers[6] * 2 +
      idNumbers[7] * 1 +
      idNumbers[8]; // 最後一碼為檢查碼

    return checkSum % 10 === 0;
  }

  // 驗證台灣公司統一編號
  const companyRegex = /^\d{8}$/;
  if (companyRegex.test(id)) {
    const weights = [1, 2, 1, 2, 1, 2, 4, 1];
    const digits = id.split("").map(Number);

    const sum = digits.reduce((acc, digit, index) => {
      const product = digit * weights[index];
      return acc + Math.floor(product / 10) + (product % 10);
    }, 0);

    return sum % 10 === 0 || (digits[6] === 7 && (sum + 1) % 10 === 0);
  }

  return false;
}

function validateAmount(amount: any): boolean {
  const amt = String(amount).trim();
  const numericValue = Number(amt);
  return !isNaN(numericValue) && numericValue >= 0;
}

function validateCrDr(val: string): boolean {
  return val === "CR" || val === "DR";
}

function validateDate(dateStr: string): boolean {
  const datePattern = /^(\d{3})(\d{2})(\d{2})$/;
  const match = dateStr.match(datePattern);

  if (!match) return false;

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const fullYear = 1911 + year;
  if (month < 1 || month > 12) return false;

  const date = new Date(fullYear, month - 1, day);
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(fullYear, month - 1, day);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate >= today;
}

function checkDuplicateCode(duplicateCode: string): boolean {
  return !isNaN(Number(duplicateCode)) && Number(duplicateCode) > 0;
}
