import { Config, Record, Error } from "./types";
import { ERROR_MESSAGES } from "./errors";
import {
  validateAccNum,
  validateAmount,
  validateCrDr,
  validateDate,
  validateID,
  checkDuplicateCode,
} from "./validators";
export const DEFAULT_ABSTRACT_TYPE = "24";

// Constants for error messages

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
