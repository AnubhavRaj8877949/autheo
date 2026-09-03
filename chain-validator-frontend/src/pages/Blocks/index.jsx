/* eslint-disable */
import { Typography } from "@mui/material";
import BlocksTable from "./BlocksTable";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../constants";

const BlocksPage = () => {
  const viewAllBlocks = () => {
    window.open(`${BASE_URL.EXPLORER_NAVIGATION_URL}/blocks`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="common-table">
      <Typography variant="h3" letterSpacing="normal">
        Blocks
        <Link to="/" className="headermetaBtn viewAllBtn" onClick={viewAllBlocks}>
          View All
        </Link>
      </Typography>
      <BlocksTable />
    </div>
  );
};

export default BlocksPage;
