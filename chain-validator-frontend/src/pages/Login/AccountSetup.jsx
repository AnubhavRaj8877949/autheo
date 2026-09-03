/*eslint-disable*/
import {
  Button,
  InputAdornment,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";

import TextField from "../../components/Common/TextField";
import InfoIcon from "../../assets/Icons/InfoIcon";

const AccountSetup = ({ setName, name, setupHandler, isNodeAdded }) => {
  const changeNameHandler = (e) => {
    let inputVal = e.target.value.trimStart().replace(/\s+/g, " ");

    if (/^[a-zA-Z\s]*$/.test(inputVal)) {
      setName(inputVal);
    }
  };

  const isNameValid = name.length >= 2; // Check if name length is at least 2 characters

  return (
    <form onSubmit={setupHandler}>
      <TextField
        label="Name"
        value={name}
        placeholder="Enter name for your account"
        maxlength={15}
        autoComplete='off'
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip
                className="tooltip-common"
                placement="top"
                arrow
                title={
                  <Typography fontSize={15}>
                    This name will be linked with your wallet address and will
                    be visible to other users.
                  </Typography>
                }
                followCursor
                style={{ fontSize: "20px" }}
              >
                <Box
                  sx={{
                    color: "background.paper",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  className="infoIcon"
                >
                  <InfoIcon />
                </Box>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        onChange={changeNameHandler}
      />
      {!isNodeAdded && (
        <h3 style={{ color: "red" }}>NOTE: Connect With Node For Login</h3>
      )}
      <Button
        className="primary-btn"
        variant="contained"
        fullWidth
        sx={{ marginTop: "28px" }}
        type="submit"
        disabled={!isNameValid || isNodeAdded} // Disable the button if name is invalid or if connected
      >
        Finish
      </Button>
    </form>
  );
};

export default AccountSetup;
