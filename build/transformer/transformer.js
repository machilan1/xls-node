"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ABSTRACT_TYPE = void 0;
exports.validateTransferRecords = validateTransferRecords;
const errors_1 = require("./errors");
const validators_1 = require("./validators");
exports.DEFAULT_ABSTRACT_TYPE = "24";
// Constants for error messages
// TODO: CreateTransferRecords()
function validateTransferRecords(config, records) {
    const configErrors = [];
    const formatErrors = [];
    const recordErrors = [];
    config.abstractType = config.abstractType || exports.DEFAULT_ABSTRACT_TYPE;
    // Validate config
    validateConfig(config, configErrors);
    if (configErrors.length > 0) {
        throw new Error("Config validation failed: " + JSON.stringify(configErrors));
    }
    //validate record format
    validateRecordFormat(records, formatErrors);
    if (formatErrors.length > 0) {
        throw new Error("Record format validation failed: " + JSON.stringify(formatErrors));
    }
    // Validate records
    records.forEach((record) => {
        validateRecord(record, recordErrors);
    });
    if (recordErrors.length > 0) {
        throw new Error("Record validation failed: " + JSON.stringify(recordErrors));
    }
}
function validateConfig(config, errors) {
    if (!(0, validators_1.validateDate)(config.date)) {
        errors.push({
            target: "config.date",
            data: config.date,
            message: errors_1.ERROR_MESSAGES.INVALID_DATE,
        });
    }
    if (!(0, validators_1.checkDuplicateCode)(config.duplicateCode)) {
        errors.push({
            target: "config.duplicateCode",
            data: config.duplicateCode,
            message: errors_1.ERROR_MESSAGES.INVALID_DUPLICATE_CODE,
        });
    }
}
function validateRecordFormat(records, errors) {
    const firstRecord = records[0];
    if (firstRecord && firstRecord.crDr !== "DR") {
        errors.push({
            target: `record serialNum: ${firstRecord.serialNum}`,
            data: firstRecord.crDr,
            message: errors_1.ERROR_MESSAGES.FIRST_RECORD_DR_REQUIRED,
        });
    }
}
function validateRecord(record, errors) {
    const { entry, crDr, serialNum } = record;
    if (!(0, validators_1.validateAccNum)(entry.acctKind, entry.acctNum)) {
        errors.push({
            target: `record serialNum: ${serialNum}`,
            data: { acctKind: entry.acctKind, acctNum: entry.acctNum },
            message: errors_1.ERROR_MESSAGES.ACCOUNT_ERROR,
        });
    }
    if (!(0, validators_1.validateID)(entry.id)) {
        errors.push({
            target: `record serialNum: ${serialNum}`,
            data: entry.id,
            message: errors_1.ERROR_MESSAGES.ID_FORMAT_ERROR,
        });
    }
    if (!(0, validators_1.validateAmount)(entry.amount)) {
        errors.push({
            target: `record serialNum: ${serialNum}`,
            data: entry.amount,
            message: errors_1.ERROR_MESSAGES.NEGATIVE_AMOUNT_ERROR,
        });
    }
    if (!(0, validators_1.validateCrDr)(crDr)) {
        errors.push({
            target: `record serialNum: ${serialNum}`,
            data: crDr,
            message: errors_1.ERROR_MESSAGES.INVALID_CRDR,
        });
    }
}
