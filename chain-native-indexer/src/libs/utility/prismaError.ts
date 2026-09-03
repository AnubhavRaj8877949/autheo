import { Prisma } from "@prisma/client";
import logger from "../logger";

export const DB_ERROR_CODE = {
  UNIQUE_CONSTRAINT: "P2002",
  FOREIGN_KEY_CONSTRAINT: "P2003",
  NULL_CONSTRAINT: "P2011",
  INVALID_VALUE: "P2005",
  RECORD_NOT_FOUND: "P2025",
  CONNECTION_FAILED: "P1001",
  OPERATION_TIMEOUT: "P1008",
} as const;

type KnownDbErrorCode = (typeof DB_ERROR_CODE)[keyof typeof DB_ERROR_CODE];

const ERROR_MESSAGES: Record<KnownDbErrorCode, string> = {
  [DB_ERROR_CODE.UNIQUE_CONSTRAINT]: "Record already exists (unique constraint violation)",
  [DB_ERROR_CODE.FOREIGN_KEY_CONSTRAINT]: "Related record not found (foreign key constraint)",
  [DB_ERROR_CODE.NULL_CONSTRAINT]: "Required field is missing",
  [DB_ERROR_CODE.INVALID_VALUE]: "Invalid field value provided",
  [DB_ERROR_CODE.RECORD_NOT_FOUND]: "Record not found",
  [DB_ERROR_CODE.CONNECTION_FAILED]: "Database connection failed",
  [DB_ERROR_CODE.OPERATION_TIMEOUT]: "Database operation timed out",
};

export class PrismaErrorHandler {
  static isKnownError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
    return err instanceof Prisma.PrismaClientKnownRequestError;
  }

  static isValidationError(err: unknown): err is Prisma.PrismaClientValidationError {
    return err instanceof Prisma.PrismaClientValidationError;
  }

  static isUniqueConstraint(err: unknown): boolean {
    return this.isKnownError(err) && err.code === DB_ERROR_CODE.UNIQUE_CONSTRAINT;
  }

  static isRecordNotFound(err: unknown): boolean {
    return this.isKnownError(err) && err.code === DB_ERROR_CODE.RECORD_NOT_FOUND;
  }

  static isForeignKeyConstraint(err: unknown): boolean {
    return this.isKnownError(err) && err.code === DB_ERROR_CODE.FOREIGN_KEY_CONSTRAINT;
  }

  static getErrorMessage(err: unknown): string {
    if (this.isKnownError(err)) {
      return ERROR_MESSAGES[err.code as KnownDbErrorCode] ?? `Database error (code: ${err.code})`;
    }
    if (this.isValidationError(err)) {
      return `Prisma validation error: ${err.message}`;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return "Unknown database error";
  }

  /**
   * Logs the error and returns a normalized `{ error: boolean }` result.
   *
   * @param options.ignoreDuplicate - Return `error: false` for unique constraint violations
   *   (idempotent writes where a duplicate is an acceptable outcome).
   */
  static handle(
    err: unknown,
    context: string,
    options: { ignoreDuplicate?: boolean } = {},
  ): { error: boolean; message: string } {
    const message = this.getErrorMessage(err);

    if (options.ignoreDuplicate && this.isUniqueConstraint(err)) {
      return { error: false, message };
    }

    logger.error(`[DB:${context}] ${message}`, err);
    return { error: true, message };
  }
}
