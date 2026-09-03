import { toast } from "../components/Common/Toast/Toast";
import getTransactionLogs from "./apis/checkTransactionLogs";
import { ROUTE_PATHS } from "../constants";

export const checkTransaction = async (userAddress, navigate) => {
  try {
    const txLogs = await getTransactionLogs(userAddress);
    if (txLogs?.result?.tx_result?.data === null) {
      toast.error("Transaction failed");
      navigate(ROUTE_PATHS.DASHBOARD);
      return false;
    } else {
      toast.success("Transaction successful");
      navigate(ROUTE_PATHS.DASHBOARD);
      return true;
    }
  } catch (error) {
    toast.error("Failed to fetch transaction status.");
    return false;
  }
};
