// TODO: There are some record validation not implemented yet.
// TODO: These functions should be tested
export function validateAccNum(acctKind: string, acctNum: string): boolean {
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

export function validateID(id: string): boolean {
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

export function validateAmount(amount: any): boolean {
  const amt = String(amount).trim();
  const numericValue = Number(amt);
  return !isNaN(numericValue) && numericValue >= 0;
}

export function validateCrDr(val: string): boolean {
  return val === "CR" || val === "DR";
}

export function validateDate(dateStr: string): boolean {
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

export function checkDuplicateCode(duplicateCode: string): boolean {
  return !isNaN(Number(duplicateCode)) && Number(duplicateCode) > 0;
}
