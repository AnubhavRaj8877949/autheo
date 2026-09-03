/* eslint-disable */
import { Skeleton, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../assets/Icons/CopyIcon";
import { NotFoundIcon } from "../../assets/Icons/SvgIcon";
import { toast } from "../../components/Common/Toast/Toast";
import { DEFAULT_PAGE, PAGE_LIMIT } from "../../constants";
import getAllBlocks from "../../services/apis/getAllBlocks";
import { showEVMAddress } from "../../services/showEVMAddress";
import reduceData, {
  isTimeAgoByCreatedDate,
} from "../../utils/commonFunctions";

const tableHeader = ["Blocks", "Block Hash", "Validator", "Time"];

const BlocksTable = () => {
  const [blocks, setBlocks] = useState([]);
  const [blockStatus, setBlockStatus] = useState("Init");
  const [evmAddresses, setEvmAddresses] = useState({}); // Store EVM addresses
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvmAddresses = () => {
      const updatedAddresses = {};
      for (const validator of blocks) {
        if (validator?.miner) {
          updatedAddresses[validator.miner] = showEVMAddress(
            validator.miner
          );
        }
      }
      setEvmAddresses(updatedAddresses);
    };

    if (blocks.length > 0) {
      fetchEvmAddresses();
    }
  }, [blocks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setBlockStatus("Fetching");
        const response = await getAllBlocks(DEFAULT_PAGE, PAGE_LIMIT);
        if (response?.error) {
          setBlockStatus("Error");
          return err;
        }
        setBlocks(response?.data?.blocks);
        setBlockStatus("Success");
      } catch (err) {
        setBlockStatus("Error");
        return err;
      }
    };
    fetchData();
  }, []);

  const renderSkeletonRow = () => (
    <TableRow>
      {tableHeader.map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="text" width="80%" />
        </TableCell>
      ))}
    </TableRow>
  );

  const copiedAddress = (data) => {
    navigator.clipboard.writeText(data);
    toast.success("Copied");
  };
  const getdata = (address) => {
    navigate(`/validators/${address}`);
  };

  return (
    <TableContainer component={Paper}>
      {blockStatus === "Error" ? (
        <div className="Nodata">
          <NotFoundIcon />
          No Data
        </div>
      ) : (
        <Table
          sx={{ minWidth: 650 }}
          aria-label="simple table"
          className="block-table"
        >
          <TableHead>
            <TableRow>
              {tableHeader?.map((item, index) => (
                <TableCell key={index}>
                  <Typography
                    color="text.secondary"
                    fontSize="16px"
                    lineHeight="20px"
                    fontWeight="400"
                  >
                    {item}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {blockStatus === "Fetching"
              ? Array.from({ length: 10 }).map((_, index) =>
                renderSkeletonRow()
              ) // Render 5 skeleton rows
              : blocks?.map((data) => (
                <TableRow
                  key={data?.id}
                  sx={{
                    "&:last-of-type td, &:last-of-type th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <div className="id-wrap">
                      <Typography variant="body2">
                        {data?.blockhash ? (
                          <span
                          // className="text-hover"
                          // onClick={() => transactionHash(data?.blocknumber)}
                          // style={{ cursor: "pointer" }}
                          >
                            {data?.blocknumber}
                          </span>
                        ) : (
                          ""
                        )}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <text className="text-hover1" sx={{ display: "flex" }}>
                        {data?.blockhash ? (
                          <>
                            <span
                              // onClick={() => transactionHash(data?.blockhash)}
                              // style={{ cursor: "pointer" }}
                              className="blockdd"
                            >
                              {reduceData(data?.blockhash)}
                            </span>
                          </>
                        ) : (
                          ""
                        )}
                      </text>
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      <text className="text-hover" sx={{ display: "flex" }}>
                        {data?.miner ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              maxWidth: "180px",
                              width: "100%",
                            }}
                          >
                            <span
                              className="blockdds"
                              onClick={() =>
                                getdata(evmAddresses[data?.miner])
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {reduceData(evmAddresses[data?.miner])}
                            </span>
                            <span
                              className="copy-btn"
                              onClick={() =>
                                copiedAddress(evmAddresses[data?.miner])
                              }
                            >
                              <CopyIcon sx={{ fontSize: "17px" }} />
                            </span>
                          </div>
                        ) : (
                          ""
                        )}
                      </text>
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {data?.createdAt
                        ? isTimeAgoByCreatedDate(data?.createdAt)
                        : ""}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default BlocksTable;
