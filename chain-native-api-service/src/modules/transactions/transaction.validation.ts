import * as express from "express";
import * as Joi from "joi";
import { RESPONSES } from "../../constant";

export const getTxByHashValidation = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const schema = Joi.object({
    transactionHash: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        } else if (!value.startsWith("0x")) {
          return helpers.error("custom.validHash");
        } else if (value.length !== 66) {
          return helpers.error("custom.hashLength");
        }
      })

      .messages({
        "custom.validHash": "transaction hash should be start with 0x",
        "custom.hashLength": "transaction hash length should be equals to 66",
        "custom.noLeadingSpaces":
          "transaction hash should not start with a space",
        "string.pattern.base": "transaction hash must start with 0x",
        "string.base": "transaction hash must be a string",
        "any.required": "transaction hash is required",
        "string.empty": "transaction hash cannot be empty",
      }),
  });
  const { error, value } = schema.validate(req.params);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }
  next();
};
const isNumeric = (str: string) => {
  const pattern = /^-?\d*\.?\d+$/;
  return pattern.test(str);
};
export const getTxByBlock = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const querySchema = Joi.object({
    value: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        if (!isNumeric(value)) {
          if (!value.startsWith("0x")) {
            return helpers.error("custom.invalidHash");
          }
          if (value.startsWith("0x") && !(value.length === 66)) {
            return helpers.error("custom.hashLength");
          }
        } else {
          if (value.includes(".")) {
            return helpers.error("custom.noDecimals");
          }
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            return helpers.error("custom.nonzero");
          }
        }
        return Number(value);
      })
      .messages({
        "custom.noDecimals": "block number should not be in decimal",
        "custom.nonzero": "block number should be greater than 0",
        "custom.noLeadingSpaces": "block number should not start with a space",
        "string.pattern.base": "block hash must start with 0x",
        "string.base": "block hash must be a string",
        "any.required": "block number is required",
        "string.empty": "block cannot be empty",
        "custom.invalidblock": "invalid block number",
        "custom.invalidHash":
          "block hash or transaction hash should be start with 0x",
      }),
    page: Joi.string()

      .required()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());
        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          value.toString().length >= 19
        ) {
          return helpers.error("custom.invalidPage");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.noLeadingSpaces": "page should not start with a space",
        "any.required": "page is required",
        "custom.invalidPage": "invalid page number",
      }),
    limit: Joi.string()
      // .trim()
      .required()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());
        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          parsedValue > 10
        ) {
          return helpers.error("custom.number");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.number": "limit should be a valid integer between 1 and 10",
        "custom.noLeadingSpaces": "limit should not start with a space",
        "any.required": "limit is required",
      }),
  });

  const queryResult = querySchema.validate(req.query);

  if (queryResult.error) {
    return res.status(400).json({
      error: true,
      message: queryResult.error.details[0].message,
    });
  }

  next();
};

export const transactionSearch = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const schema = Joi.object({
    page: Joi.string()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());

        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          value.toString().length >= 19
        ) {
          return helpers.error("custom.invalidPage");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.noLeadingSpaces": "page should not start with a space",
        "any.required": "page is required",
        "custom.invalidPage": "invalid page number",
      }),
    limit: Joi.string()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());
        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          parsedValue > 10
        ) {
          return helpers.error("custom.number");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.number": "limit should be a valid integer between 1 and 10",
        "custom.noLeadingSpaces": "limit should not start with a space",
        "any.required": "limit is required",
      }),
    address: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        if (value.length < 42) {
          return helpers.error("custom.hashLength");
        }
      })
      .messages({
        "custom.hashLength": "address length should be equals to 42",
        "custom.noLeadingSpaces": "address should not start with a space",
        "any.required": "address is required",
        "string.empty": "address cannot be empty",
      }),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res
      .status(RESPONSES.BADREQUEST)
      .json({ error: true, message: error.details[0].message });
  }
  next();
};

export const getTransactionsValidation = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const schema = Joi.object({
    page: Joi.string()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());
        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          value.toString().length >= 19
        ) {
          return helpers.error("custom.invalidPage");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.noLeadingSpaces": "page should not start with a space",
        "any.required": "page is required",
        "custom.invalidPage": "invalid page number",
      }),
    limit: Joi.string()
      .custom((value, helpers) => {
        if (value.startsWith(" ")) {
          return helpers.error("custom.noLeadingSpaces");
        }
        const parsedValue = parseFloat(value.trim());
        if (
          isNaN(value) ||
          !Number.isInteger(parsedValue) ||
          parsedValue < 1 ||
          parsedValue > 200
        ) {
          return helpers.error("custom.number");
        }
        return parsedValue;
      }, "Number Validation")
      .messages({
        "custom.number": "limit should be a valid integer between 1 and 200",
        "custom.noLeadingSpaces": "limit should not start with a space",
        "any.required": "limit is required",
      }),
    order: Joi.string()
      .optional()
      .custom((value, helpers) => {
        if (value === "desc" || value === "asc") {
          return value;
        }
        return helpers.error("custom.order");
      })
      .messages({
        "custom.order": "Order must be dsec or asc.",
      }),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }
  next();
};
