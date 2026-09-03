/*eslint-disable*/
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { BASE_URL, CURRENCY, DEFAULT_TABLE_LIMIT, EVM_EXPLORER } from "../../constants";
import { Pagination } from "../../components/Dashboard/ValidatorCard/pageStyle";
import FlexBox from "../../components/Common/FlexBox";
import SkeletonRow from "../../components/SkeletonRow/SkeletonRow";
import { PrevIcon, NextIcon } from "../../assets/Icons/SvgIcon.jsx";
import CopyIcon from "../../assets/Icons/CopyIcon";
import { toast } from "../../components/Common/Toast/Toast";
import { NotFoundIcon } from "../../assets/Icons/SvgIcon";
import { Link, useLocation } from "react-router-dom";
import { formatMillionNumber, noExponential } from "../../utils/commonFunctions";
import moment from "moment";
import getData from "../../utils/getData";

const tableHeader = ["Transaction Hash", "Amount", "Vesting Address", "Timestamp"];

const openTxnDetailsPage = (txnHash) => {
  window.open(`${EVM_EXPLORER}/tx/${txnHash}`, "_blank", "noopener,noreferrer");
};

const copiedAddress = (data) => {
  navigator.clipboard.writeText(data);
  toast.success("Copied");
};

const GenesisRewardTable = ({ showAll, txnsPaging, txStatus, totalPages, handlePageChange, pageParams, setTotalCount }) => {

  const showRecentActivitiesData = showAll ? txnsPaging.txns : txnsPaging.txns?.slice(0, 5);
  const renderTableRows = () => {
    if (txStatus === "Fetching") {
      return Array.from({ length: 5 }).map((_, index) => (
        <SkeletonRow key={index} columns={tableHeader.length} />
      ));
    }
    if (showRecentActivitiesData?.length === 0 || !showRecentActivitiesData) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              border: "0 !important",
            }}
          >
            <Typography variant="body2" align="center">
              No Recent Activity Available
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    return showRecentActivitiesData?.map((data, index) => (
      <TableRow
        key={index}
        sx={{
          "&:last-of-type td, &:last-of-type th": { border: 0 },
        }}
      >
        <TableCell>
          <Typography variant="body2">
            <span

            >
              <Link className="recentHash_link" onClick={(e) => {
                e.preventDefault();
                openTxnDetailsPage(data?.transactionHash)
              }}>
                <span className="recentHash"> {data?.transactionHash || "-"}</span>
              </Link>
              <span
                onClick={() =>
                  copiedAddress(
                    data?.transactionHash
                  )
                }
                className="copy-btn"
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                }}
              >
                <CopyIcon sx={{ fontSize: 17 }} />
              </span>
            </span>
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            <Tooltip
              title={
                data?.amount
                  ? noExponential(
                    Number(data?.amount) / 10 ** 18
                  )
                  : "0"
              }
              arrow
              placement="top-start"
            >
              {data?.amount ? formatMillionNumber(data?.amount / (10 ** 18)) : 0} {CURRENCY}
            </Tooltip>
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {getData(data?.vestingAddress) || "-"}
            <span
              onClick={() =>
                copiedAddress(
                  data?.vestingAddress
                )
              }
              className="copy-btn"
              style={{
                marginLeft: "10px",
                cursor: "pointer",
              }}
            >
              <CopyIcon sx={{ fontSize: 17 }} />
            </span>
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {data?.timestamp ? moment(Number(data.timestamp) * 1000).format("MMM DD, YYYY HH:mm") : "-"}
          </Typography>
        </TableCell>
      </TableRow >
    ));
  };

  return (
    <>
      <TableContainer
        sx={{
          border: "1px solid var(--theme-border-primary)",
          borderRadius: "14px",
        }}
      >
        {txStatus === "Error" ||
          (txStatus === "Success" &&
            (!showRecentActivitiesData || showRecentActivitiesData.length === 0)) ? (
          <div className="Nodata">
            <NotFoundIcon />
            No Data
          </div>
        ) : (
          <Table sx={{ minWidth: 800 }} aria-label="action table">
            <TableHead>
              <TableRow>
                {tableHeader.map((item, index) => (
                  <TableCell key={index}>
                    <Typography variant="label">{item}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderTableRows()}</TableBody>
          </Table>
        )}
      </TableContainer>
      {txnsPaging.txns?.length > 0 && totalPages > 1 && showAll && (
        <FlexBox
          sx={{
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Pagination
            prefix={<PrevIcon />}
            count={totalPages}
            variant="outlined"
            shape="rounded"
            page={pageParams?.page}
            onChange={handlePageChange}
            style={{ marginLeft: "auto" }}
          />
        </FlexBox>
      )}
    </>
  );
};

export default GenesisRewardTable;
