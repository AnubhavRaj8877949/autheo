/*eslint-disable*/
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { StyledTableCell } from "./styles";
import { CURRENCY } from "../../../constants";
import { noExponential } from "../../../utils/commonFunctions";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import { toFixed } from "../../../utils/toFixed";

const ValidatorTable = ({ dasboardData }) => {
  const tableHeader = ["Status", "Stake", "Commission"];

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: "0 !important" }}>
        {dasboardData && (
          <Table sx={{ minWidth: 800 }} aria-label="validators table">
            <TableHead>
              <TableRow
                sx={{
                  "th:first-of-type": { pl: 10 },
                  "th:last-of-type": { pr: 10 },
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
            <TableBody>
              <TableRow
                sx={{ "&:last-of-type td, &:last-of-type th": { border: 0 } }}
              >
                <StyledTableCell sx={{ pl: 10 }}>
                  <Typography variant="body2">
                    {dasboardData?.status
                      ? capitalizeFirstLetter(dasboardData?.status)
                      : "-"}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="body2">
                    {dasboardData?.totalStake
                      ? noExponential(
                          toFixed(
                            Number(dasboardData?.totalStake) / 10 ** 18,
                            4
                          )
                        )
                      : 0}{" "}
                    {CURRENCY}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ pr: 10 }}>
                  <Typography variant="body2">
                    {/* {dasboardData?.commissionRate
                      ? noExponential(toFixed(dasboardData?.commissionRate, 4)*100)
                      : 0}
                    % */}
                      {dasboardData?.commissionRate
                        ? (parseFloat(dasboardData.commissionRate) * 100)
                          .toFixed(2)
                          .replace(/\.?0+$/, "")
                        : 0}
                      %
                  </Typography>
                </StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
};

export default ValidatorTable;
