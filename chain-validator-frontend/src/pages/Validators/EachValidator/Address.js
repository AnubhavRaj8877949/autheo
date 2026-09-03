/* eslint-disable */
import { Typography } from "@mui/material";
import { Wrapper } from "./styles";
import CopyIcon from "../../../assets/Icons/CopyIcon";
import { toast } from "../../../components/Common/Toast/Toast";

const Address = ({ variant, address, showIcon, ...props }) => {
  const copiedAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address Copied");
  };

  return (
    <Wrapper {...props} className="addres-input">
      <Typography className="address-text">{address}</Typography>
      {showIcon && (
        <span onClick={copiedAddress} className="copy-btn">
          <CopyIcon sx={{ fontSize: "17px" }} />
        </span>
      )}
    </Wrapper>
  );
};

export default Address;
