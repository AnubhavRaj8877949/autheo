import {
  renderTime,
  capitalizeWord,
  convertToDateTime,
} from "../../utils/helper";
import "./index.scss";
import { CURRENCY, PREFIX } from "../../constants";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { Copy } from "../../components/Common/Copy";
import { noExponential } from "../../utils/commonFunctions";
import Heading from "../../components/Common/Heading/Heading";
import { getTransactionByHash } from "../../services/apis/checkTransactionLogs";

const TxDetails = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { txId } = useParams();

  const isLoading = !data && !error;

  useEffect(() => {
    (async () => {
      if (txId) {
        try {
          const txData = await getTransactionByHash(txId);
          setData(txData?.data?.transaction ?? {});
        } catch (err) {
          setError(err);
        }
      }
    })();
  }, [txId]);

  return (
    <div className="container">
      <Heading heading="Transaction Details" />

      <div className="doubleCardTranfer">
        <div className="transferinfo">
          {/* Status */}
          <div className="information">
            <p>Status</p>
            {isLoading ? (
              <Skeleton variant="text" width={100} />
            ) : data?.status ? (
              <span
                className={
                  data.status?.toLowerCase() === "failed"
                    ? "failedtrans"
                    : "success"
                }
              >
                {capitalizeWord(data.status)}
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* Transaction Hash */}
          <div className="information">
            <p>Transaction Hash</p>
            {isLoading ? (
              <Skeleton variant="text" width={180} />
            ) : data?.txhash ? (
              <span>
                {data?.txhash}
                <Copy text={data?.txhash} />
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* From Address */}
          <div className="information">
            <p>From</p>
            {isLoading ? (
              <Skeleton variant="text" width={180} />
            ) : data?.fromAddress ? (
              <span>
                {data.fromAddress}
                <Copy text={data?.fromAddress} />
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* To Address or Contract */}
          <div className="information">
            <p>To</p>
            {isLoading ? (
              <Skeleton variant="text" width={180} />
            ) : data?.toAddress && data.toAddress !== "N/A" ? (
              <span>
                {data.toAddress}
                {(data.toAddress.startsWith("0x") ||
                  (PREFIX && data.toAddress.startsWith(PREFIX))) && (
                    <Copy text={data?.toAddress} />
                  )}
              </span>
            ) : data?.contractAddress && data.contractAddress !== "N/A" ? (
              <span>
                {data.contractAddress}
                <Copy text={data?.contractAddress} />
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* Block Number */}
          <div className="information">
            <p>Block Number</p>
            {isLoading ? (
              <Skeleton variant="text" width={100} />
            ) : data?.blocknumber ? (
              <span>
                {data.blocknumber}
                <Copy text={data?.blocknumber} />
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* Amount */}
          <div className="information">
            <p>Amount</p>
            {isLoading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <span>
                {data?.value ? noExponential(data.value) : "0"}{" "}
                {CURRENCY.toUpperCase()}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <div className="information">
            <p>Timestamp</p>
            {isLoading ? (
              <Skeleton variant="text" width={180} />
            ) : data?.timestamp ? (
              <span className="realTime">
                {convertToDateTime(data.timestamp)},
                <span className="secondAgo"> {renderTime(data.timestamp)}</span>
              </span>
            ) : data?.createdAt ? (
              <span className="timestamp">
                {convertToDateTime(data.createdAt)}
                <span> {renderTime(data.createdAt)}</span>
              </span>
            ) : (
              "-"
            )}
          </div>

          {/* Fee */}
          <div className="information">
            <p>Fee</p>
            {isLoading ? (
              <Skeleton variant="text" width={100} />
            ) : (
              <span>
                {data?.txFee ? noExponential(Number(data.txFee)) : "0"}{" "}
                {CURRENCY.toUpperCase()}
              </span>
            )}
          </div>

          {/* Method */}
          <div className="information">
            <p>Method</p>
            {isLoading ? (
              <Skeleton variant="text" width={100} />
            ) : (
              <span>{data?.type ? capitalizeWord(data.type) : "-"}</span>
            )}
          </div>

          {/* Gas Used */}
          <div className="information">
            <p>Gas Used</p>
            {isLoading ? (
              <Skeleton variant="text" width={80} />
            ) : (
              <span>{data?.gasUsed ?? "0"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TxDetails;
