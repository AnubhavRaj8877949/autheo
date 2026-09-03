/*eslint-disable*/
import { Button, Typography } from "@mui/material";
import CommonBtn from "../../../../components/Common/CommonBtn/CommonBtn.jsx";
import { useEffect, useState } from "react";
import TextField from "../../../../components/Common/TextField";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BondWrapper } from "../styles";
import { WALLET_TYPE, ROUTE_PATHS } from "../../../../constants";
import BackButton from "../../../../components/BackButton/BackButton";
import { countDecimal, removeZero } from "../../../../utils/helper";
import { bondMoreValidations } from "../../../../utils/validatorValidations";
import Loader from "../../../../components/Loader/Loader";
import { toast } from "../../../../components/Common/Toast/Toast";
import { toFixed } from "../../../../utils/toFixed";
import { isTxOccur } from "../../../../redux/reducer/auth";
import { BackIcon } from "../../../../assets/Icons/SvgIcon.jsx";
import { keplrBondMore } from "../../../../keplrEvents/keplrBondMore.js";
import { getAddress } from "../../../../services/getAddress.js";
import { checkTransaction } from "../../../../services/checkTransaction.js";
import bondMoreFunds from "../../../../services/bondMoreFunds.js";
import { cosmosStationBondMore } from "../../../../cosmostationEvents/bondMore.js";

const Bond = () => {
  const navigate = useNavigate();
  const [bondAmount, setBondAmount] = useState("");
  let nodeUrl = localStorage.getItem("node") || "";
  const { userAddress, userBalance, valoperAddress, walletType } = useSelector(
    (state) => state.auth
  );
  const [mnemonics, setMnemonics] = useState();
  const [errMsg, setErrMsg] = useState({
    amount: "",
    mnemonics: "",
  });
  const [isDisable, setIsDisable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const maxAmt = async () => {
    setBondAmount(toFixed(userBalance, 7));
    if (Number(userBalance) > 0) {
      setBondAmount(toFixed(userBalance, 7));
    } else {
      setBondAmount(0);
    }
  };

  useEffect(() => {
    if (!bondAmount || errMsg?.amount?.length > 0) {
      setIsDisable(true);
    } else if (
      (!mnemonics && walletType === WALLET_TYPE.NO_WALLET) ||
      (errMsg?.mnemonics?.length > 0 && walletType === WALLET_TYPE.NO_WALLET)
    ) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [errMsg, bondAmount, mnemonics]);

  const handleChange = async (e) => {
    let { name, value } = e.target;
    if (name === "Bond_Amount") {
      if (
        !isNaN(Number(value)) &&
        value !== " " &&
        !value.includes("+") &&
        !value.includes("-") &&
        countDecimal(value) <= 18
      ) {
        bondMoreValidations(e, setErrMsg, userBalance);
        let val = removeZero(e.target.value);
        setBondAmount(val);
      }
    }
    if (name === "Mnemonics") {
      bondMoreValidations(e, setErrMsg);
      setMnemonics(value);
    }
  };

  const onSubmit = async () => {
    try {
      if (walletType === WALLET_TYPE.NO_WALLET) {
        let res = await getAddress(mnemonics);
        if (res?.message) {
          return toast.error(res?.message);
        }
        if (res?.length > 0 && res !== userAddress) {
          toast.error("Mnemonics are not same as login");
          return;
        }
      }
      setIsLoading(true);

      if (walletType === WALLET_TYPE.NO_WALLET) {
        const response = await bondMoreFunds(
          mnemonics,
          userAddress,
          bondAmount,
          valoperAddress
        );

        if (response) {
          dispatch(isTxOccur(true));
          setTimeout(() => checkTransaction(response, navigate), 3000);
        }
        return;
      }
      const data = {
        userAddress,
        bondAmount,
        valoperAddress,
        nodeUrl,
      };
      if (walletType === WALLET_TYPE.KEPLR) {
        const res = await keplrBondMore(
          userAddress,
          bondAmount,
          valoperAddress,
          setIsLoading,
          navigate
        );
      } else if (walletType === WALLET_TYPE.COSMOSTATION) {
        const res = await cosmosStationBondMore(
          userAddress,
          valoperAddress,
          bondAmount,
          setIsLoading,
          navigate
        );
      }

    } catch (err) {
      setIsLoading(false);
      navigate(ROUTE_PATHS.DASHBOARD);
      if (err instanceof Error) {
        let msg = err?.message?.split(
          "Broadcasting transaction failed with code"
        );
        toast.error(msg[1] ?? "Transaction Failed!");
      }
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <BondWrapper>
      <div className="bond-wrapper">
        <Typography className="bond-wrapper__title">
          <BackButton onClick={() => navigate(-1)} title={<BackIcon />} />
          Bond More Funds
        </Typography>
        <div className="bond-wrapper__amount">
          <div style={{ marginBottom: "30px" }}>
            <TextField
              label="Additional funds to bond"
              name="Bond_Amount"
              placeholder="Enter amount to stake"
              onChange={handleChange}
              autoComplete="off"
              value={bondAmount}
              paddingRight={100}
            />
            {errMsg?.amount?.length > 0 && (
              <p style={{ color: "red", marginTop: "-1px" }}>
                {errMsg?.amount}
              </p>
            )}
          </div>
          <Button variant="contained" className="maxBtn" onClick={maxAmt}>
            Max
          </Button>
        </div>

        {walletType === WALLET_TYPE.NO_WALLET && (
          <div className="bond-wrapper__amount">
            <div>
              <TextField
                label="Enter mnemonics to authorize the transaction"
                placeholder="Enter your mnemonics"
                name="Mnemonics"
                autoComplete="off"
                onChange={(e) => handleChange(e)}
                type="password"
              />
              {errMsg?.mnemonics?.length > 0 && (
                <p style={{ color: "red", marginTop: "-1px" }}>
                  {errMsg?.mnemonics}
                </p>
              )}
            </div>
            <span className="maxBtn">{/* <MnemonicsIcon /> */}</span>
          </div>
        )}

        <h6 style={{ marginTop: "10px" }}>
          NOTE:{" "}
          <span className="noteData">
            Your account status may take some time to update.
          </span>
        </h6>
        {/* <Button
          fullWidth
          onClick={onSubmit}
          variant="contained"
          sx={{
            marginTop: "50px",
          }}
          disabled={isDisable}
        >
          Sign and submit
        </Button> */}
        <CommonBtn
          children=" Sign and Submit"
          onClick={onSubmit}
          color="primary"
          disabled={isDisable}
        />
      </div>
    </BondWrapper>
  );
};

export default Bond;
