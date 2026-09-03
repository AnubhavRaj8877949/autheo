/*eslint-disable*/
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { BASE_URL, CURRENCY, DEFAULT_TABLE_LIMIT, TRANSACTION_STATUS } from "../../../constants";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ActionStatus, StyledTableContainer } from "./styles";
import { Pagination } from "./pageStyle";
import FlexBox from "../../Common/FlexBox";
import { usePagination } from "../../../hooks/usePagination";
import Loader from "../../Loader/Loader";
import getTxByAddress from "../../../services/apis/getTxByAddress";
import SkeletonRow from "../../SkeletonRow/SkeletonRow";
import { PrevIcon, NextIcon } from "../../../assets/Icons/SvgIcon.jsx";
import CopyIcon from "../../../assets/Icons/CopyIcon";
import { toast } from "../../Common/Toast/Toast";
import { NotFoundIcon } from "../../../assets/Icons/SvgIcon";
import { Link, useLocation } from "react-router-dom";
import { formatMillionNumber } from "../../../utils/commonFunctions";

const tableHeader = ["Transaction Hash", "Type", "Amount", "Status"];

const copiedAddress = (data) => {
  navigator.clipboard.writeText(data);
  toast.success("Tx Hash Copied");
};

const ActionTable = ({ setWalletActivitiesLength, showAll }) => {
  const { userAddress } = useSelector((state) => state.auth);
  const { pageParams, handlePageChange, totalPages, setTotalCount } =
    usePagination();
  const [txData, setTxData] = useState([]);
  const [txStatus, setTxStatus] = useState("Init");
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userAddress) {
          setTxStatus("Fetching");
          const response = await getTxByAddress(
            userAddress,
            pageParams?.page,
            DEFAULT_TABLE_LIMIT
          );
          setTxData(response?.data?.transactions);
          setTotalCount(response?.data?.count);
          setWalletActivitiesLength(response?.data?.count);
          setTxStatus("Success");
        }
      } catch (err) {
        setTxStatus("Error");
        return err;
      }
    };
    fetchData();
  }, [userAddress, pageParams?.page, pathname]);

  const showRecentActivitiesData = showAll ? txData : txData?.slice(0, 5);
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
            colSpan={4}
            sx={{
              border: "0 !important",
            }}
          >
            <Typography variant="body2" align="center">
              No Recent Action Available
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
              <Link className="recentHash_link" to={"/tx/" + data?.txhash}>
                <span className="recentHash"> {data?.txhash || "-"}</span>
              </Link>

            </span>
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{data?.type || "-"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {data?.value ? formatMillionNumber(data?.value) : 0} {CURRENCY}
          </Typography>
        </TableCell>
        <TableCell sx={{ pr: 10 }}>
          <ActionStatus
            variant="body2"
            status={data?.status}
            className={
              data?.status?.toLowerCase() === TRANSACTION_STATUS.SUCCESS_LOWER
                ? "status-success"
                : data?.status?.toLowerCase() === TRANSACTION_STATUS.PROCESSING_LOWER ||
                  data?.status?.toLowerCase() === TRANSACTION_STATUS.PENDING_LOWER
                  ? "status-processing"
                  : data?.status?.toLowerCase() === TRANSACTION_STATUS.FAILED_LOWER
                    ? "status-failed"
                    : ""
            }
          >
            {data?.status || "-"}
          </ActionStatus>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <StyledTableContainer>
        {txStatus === "Error" && !showAll ? (
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
      </StyledTableContainer>
      {txData?.length > 0 && totalPages > 1 && showAll && (
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

export default ActionTable;
