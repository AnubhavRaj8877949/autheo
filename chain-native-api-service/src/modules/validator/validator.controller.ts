import * as express from "express";
import { Request, Response } from "express";
import { Controller } from "../../interfaces/index";
import * as Helpers from "../../services/index";
import validatorService from "./validator.service";
import {
  getValidatorsValidation,
  validatorSearch,
  getDetailsValidation,
  validatorDelegatorsValidation,
} from "./validator.validation";

const setResponse = Helpers.responseHelper;

class ValidatorController implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get("", getValidatorsValidation, this.getAllValidators)
      .get("/search", validatorSearch, this.getValidatorSearch)
      .get("/details", getDetailsValidation, this.getValidatorsDetails)
      .get(
        "/delegators/:validatorAddress",
        validatorDelegatorsValidation,
        this.getValidatorDelegators,
      )
      .get("/status", getValidatorsValidation, this.getValidators);
  }

  private getAllValidators = async (request: Request, response: Response) => {
    const data = {
      page: !request.query?.page ? 0 : Number(request.query?.page) - 1,
      limit: !request.query?.limit ? 10 : Number(request.query?.limit),
      status: <string>request.query?.status,
    };
    const res = await validatorService.getAllValidators(data);
    if (res.error) {
      return setResponse.error(response, res);
    }
    return setResponse.success(response, res);
  };

  private getValidators = async (request: Request, response: Response) => {
    const data = {
      page: !request.query?.page ? 0 : Number(request.query?.page) - 1,
      limit: !request.query?.limit ? 10 : Number(request.query?.limit),
      status: <string>request.query?.status,
    };

    const res = await validatorService.getValidators(data);

    if (res.error) {
      return setResponse.error(response, res);
    }
    return setResponse.success(response, res);
  };

  private getValidatorSearch = async (request: Request, response: Response) => {
    const data: {
      limit: number;
      page: number;
      searchTerm: string;
    } = {
      searchTerm: request.query.value as string,
      page: !request.query?.page ? 0 : Number(request.query?.page) - 1,
      limit: !request.query?.limit ? 10 : Number(request.query?.limit),
    };
    const address = await validatorService.getValidatorSearch(data);
    if (address.error) {
      return setResponse.error(response, address);
    }
    return setResponse.success(response, address);
  };

  private getValidatorsDetails = async (
    request: Request,
    response: Response,
  ) => {
    const address = await validatorService.getValidatorDetails(
      <string>request.query?.address,
    );

    if (address.error) {
      return setResponse.error(response, address);
    }
    return setResponse.success(response, address);
  };

  private getValidatorDelegators = async (
    request: Request,
    response: Response,
  ) => {
    const validatorAddress = request.params.validatorAddress;
    const delegators =
      await validatorService.getValidatorDelegators(validatorAddress);

    if (delegators.error) {
      return setResponse.error(response, delegators);
    }
    return setResponse.success(response, delegators);
  };
}
export default ValidatorController;
