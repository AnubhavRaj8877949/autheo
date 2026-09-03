/* eslint-disable */
import BondTable from "../../../../components/Funds/ManageAccount/BondTable";
import { useState } from "react";
import { ManageWrapper } from "./styles";
import { Box } from "@mui/material";

const ManageAccount = () => {
  const [validatorExist] = useState(false);

  return (
    <ManageWrapper>
      {validatorExist && (
        <Box className="account-card">
          <BondTable />
        </Box>
      )}
    </ManageWrapper>
  );
};

export default ManageAccount;
