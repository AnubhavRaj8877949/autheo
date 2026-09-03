/*eslint-disable */
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useValidatorList } from "../../../hooks/useValidatorList";
import Loader from "../../Loader/Loader";
import FlexBox from "../../Common/FlexBox";
// import { usePagination } from '../../../hooks/usePagination';
import { usePagination } from "../../../hooks/usePagination";
import { useEffect, useState } from "react";
// import getAddress from '../../../utils/getAddress';
import { formatNumbers } from "../../../utils/formatNumbers";
import { PAGE_LIMIT } from "../../../constants";
import { Pagination } from "./styles";
import { DECIMAL } from "../../../constants";
import { toFixed } from "../../../services/toFixed";

const SlashedTable = ({ tabId }) => {
  const { pageParams, handlePageChange, totalPages, setTotalCount } = usePagination();
  const [validatorListData, setValidatorListData] = useState([]);
  const { validatorDatas, isLoading } = useValidatorList(pageParams.page);
  let number = 0;

  useEffect(() => {
    validatorDatas?.slashed?.docs?.length > 0 && validatorDatas?.slashed?.total !== undefined ? (setValidatorListData(validatorDatas?.slashed?.docs), setTotalCount(validatorDatas?.slashed?.total)) : (setValidatorListData([]), setTotalCount(0));
  }, [validatorDatas, tabId]);

  const tableHeader = ["#No", "Validator Address", "Era", "Self Stake", "Other", "Total Stake", "Payout"];

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 850 }} aria-label="validators table">
          <TableHead>
            <TableRow
              sx={{
                "th:first-of-type": { paddingLeft: "28px" },
                "th:last-of-type": { paddingRight: "28px" },
              }}
            >
              {tableHeader?.map((item, index) => (
                <TableCell key={index}>
                  <Typography variant="label" color="text.secondary">
                    {item}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {validatorListData?.length ? (
            validatorListData?.map((item, index) => (
              <TableBody key={index}>
                <TableRow key={index} sx={{ "&:last-of-type td, &:last-of-type th": { border: 0 } }}>
                  <TableCell>
                    <div className="id-wrap__icon id-wrap__icon--mr-0">
                      {pageParams?.page > 1 ? (
                        ((number = index + (pageParams?.page - 1) * PAGE_LIMIT),
                        (
                          <div className="id-wrap__icon id-wrap__icon--mr-0">
                            <span>{number + 1}</span>
                          </div>
                        ))
                      ) : (
                        <div className="id-wrap__icon id-wrap__icon--mr-0">
                          {" "}
                          <span>{index + 1}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <span>{item?.accountId || "-"}</span>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <span>{item?.eraCount || "-"}</span>
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{item?.own ? formatNumbers(parseInt(item?.own).noExponents()) : 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item?.others ? formatNumbers(parseInt(item?.others).noExponents()) : 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item?.total ? formatNumbers(parseFloat(item?.total).noExponents()) : 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item?.payout ? toFixed((parseInt(item?.payout) / 10 ** DECIMAL).noExponents(), 2) : 0} </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ))
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2">No Data</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {validatorListData?.length && totalPages > 1 ? (
        <FlexBox
          sx={{
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Pagination style={{ marginLeft: "auto" }} count={totalPages} variant="outlined" shape="rounded" page={pageParams?.page} onChange={handlePageChange} />
        </FlexBox>
      ) : (
        ""
      )}
    </>
  );
};

export default SlashedTable;
