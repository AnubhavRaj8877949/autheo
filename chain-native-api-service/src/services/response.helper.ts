import { Response } from "express";
import { RESPONSES, CONST_NAME } from "../constant";
import { IESResponse } from "../interfaces/index";

/**
 * ResponseHelper class provides standardized HTTP response handling
 * for all API endpoints across the application.
 */
class ResponseHelper {
  /**
   * Sends a successful HTTP response with status 200
   * @param response - Express Response object
   * @param responseData - Response data conforming to IESResponse interface
   * @returns Express Response with status 200 and response data
   */
  public success(response: Response, responseData: IESResponse = {}) {
    return response.status(RESPONSES.SUCCESS).send(responseData);
  }

  /**
   * Sends an error HTTP response with appropriate status code
   * - 404 for "not found" errors
   * - 400 for bad request errors
   * - 500 for internal server errors (default)
   * @param response - Express Response object
   * @param responseData - Error response data conforming to IESResponse interface
   * @returns Express Response with appropriate error status code and response data
   */
  public error(response: Response, responseData: IESResponse = {}) {
    let statusCode;
    if (responseData?.message) {
      if (responseData.message.indexOf(CONST_NAME.NOT_FOUND) !== -1) {
        statusCode = RESPONSES.NOTFOUND;
      } else {
        statusCode = RESPONSES.BADREQUEST;
      }
      return response.status(statusCode).send(responseData);
    }

    return response.status(RESPONSES.INTERNAL_SERVER).send(responseData);
  }
}
export default new ResponseHelper();
