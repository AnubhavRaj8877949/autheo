/* eslint-disable */
import React from "react";

import { Typography } from "@mui/material";
import { Wrapper } from "./styles";
import CopyIcon from "../../../assets/Icons/CopyIcon";
import { toast } from "../Toast/Toast";
import getData from "../../../utils/getData";

const Address = ({ variant, address, white, minmize, ...props }) => {
  let className = white ? "white" : "";

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address Copied");
  };

  return (
    <Wrapper {...props} className="addres-input">
      {minmize ? (
        <Typography component="span" className="address-text">
          {getData(address)}
        </Typography>
      ) : (
        <Typography component="span" className="address-text">
          {address}
        </Typography>
      )}
      <span
        data-testid="copy-button"
        onClick={copyAddress}
        className="copy-btn"
      >
        <CopyIcon className={className} sx={{ fontSize: "22px" }} />
      </span>
    </Wrapper>
  );
};

export default Address;
