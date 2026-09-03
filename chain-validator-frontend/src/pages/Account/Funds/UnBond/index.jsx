/*eslint-disable*/
import { Button, Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import CommonBtn from "../../../../components/Common/CommonBtn/CommonBtn.jsx";
import { useDispatch, useSelector } from "react-redux";
import TextField from "../../../../components/Common/TextField";
import { useNavigate } from "react-router-dom";
import { BondWrapper } from "../styles";
import BackButton from "../../../../components/BackButton/BackButton";
import Loader from "../../../../components/Loader/Loader";
import { countDecimal, removeZero } from "../../../../utils/helper";
import { bondMoreValidations } from "../../../../utils/validatorValidations";
import unBondFunds from "../../../../services/unBondFunds";
import { getAddress } from "../../../../services/getAddress";
import { toast } from "../../../../components/Common/Toast/Toast";
import { toFixed } from "../../../../utils/toFixed";
import { isTxOccur } from "../../../../redux/reducer/auth";
import { UNBONDING_PERIOD, WALLET_TYPE, ROUTE_PATHS, CURRENCY } from "../../../../constants";
import { useGenesisLock } from "../../../../hooks/useGenesisLock";
import { BackIcon } from "../../../../assets/Icons/SvgIcon.jsx";
import { keplrUnbond } from "../../../../keplrEvents/keplrUnbond.js";
import { checkTransaction } from "../../../../services/checkTransaction.js";
import { cosmostationUnbond } from "../../../../cosmostationEvents/unbond.js";

const UnBond = () => {
  const navigate = useNavigate();
  const [unBoundAmt, setUnboundAmt] = useState("");
  const [mnemonics, setMnemonics] = useState("");
  const [errMsg, setErrMsg] = useState({
    amount: "",
  });
  const [isDisable, setIsDisable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  let nodeUrl = localStorage.getItem("node") || "";

  const {
    userAddress,
    userBalance,
    valoperAddress,
    bondedBalance,
    walletType,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const {
    isGenesis,
    lockActive,
    maxUnbondable,
    minStake,
    daysRemaining,
    lockDays,
  } = useGenesisLock({
    walletAddress: userAddress,
    selfStake: bondedBalance?.bondedAmount,
  });
  const genesisLocked = isGenesis && lockActive;

  const onSubmit = async () => {
    try {
      if (walletType === WALLET_TYPE.NO_WALLET) {
        let res = await getAddress(mnemonics);
        if (res?.message) {
          return toast.error("Invalid Mnemonics");
        }
        if (res?.length > 0 && res !== userAddress) {
          toast.error("Mnemonics are not same as login");
          return;
        }
      }

      setIsLoading(true);
      const data = {
        userAddress,
        unBoundAmt,
        valoperAddress,
        nodeUrl,
      };
      if (walletType === WALLET_TYPE.KEPLR) {
        await keplrUnbond(
          userAddress,
          unBoundAmt,
          valoperAddress,
          setIsLoading,
          navigate
        );
        return;
      } else if (walletType === WALLET_TYPE.COSMOSTATION) {
        await cosmostationUnbond(
          userAddress,
          unBoundAmt,
          valoperAddress,
          setIsLoading,
          navigate
        );
        return;
      }

      if (walletType === WALLET_TYPE.NO_WALLET) {
        const response = await unBondFunds(
          mnemonics,
          userAddress,
          valoperAddress,
          unBoundAmt
        );

        if (response) {
          dispatch(isTxOccur(true));
          setTimeout(() => checkTransaction(response, navigate), 3000);
        }
        return;
      }

    } catch (err) {
      setIsLoading(false);
      navigate(ROUTE_PATHS.DASHBOARD);
      let msg = err?.message?.split(
        "Broadcasting transaction failed with code"
      );
      toast.error(msg[1]);
    }
  };

  const maxUnbond = async () => {
    const bonded =
      Number(bondedBalance?.bondedAmount) > 0
        ? Number(bondedBalance?.bondedAmount) / 10 ** 18
        : 0;
    const allowed = genesisLocked ? maxUnbondable : bonded;
    if (allowed <= 0) {
      setUnboundAmt("");
      setErrMsg((prev) => ({
        ...prev,
        amount: `No funds available to unbond. ${minStake.toLocaleString()} ${CURRENCY} stays locked for genesis validators until ${lockDays} days from activation (${daysRemaining} day(s) remaining).`,
      }));
      return;
    }
    setErrMsg((prev) => ({ ...prev, amount: "" }));
    setUnboundAmt(toFixed(allowed, 7));
  };

  useEffect(() => {
    if (!unBoundAmt || errMsg?.amount?.length > 0) {
      setIsDisable(true);
    } else if (
      (!mnemonics && walletType === WALLET_TYPE.NO_WALLET) ||
      (errMsg?.mnemonics?.length > 0 && walletType === WALLET_TYPE.NO_WALLET)
    ) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [errMsg, unBoundAmt, mnemonics]);

  const handleChange = async (e) => {
    let { name, value } = e.target;
    if (name === "Unbond_Amount") {
      if (
        !isNaN(Number(value)) &&
        value !== " " &&
        !value.includes("+") &&
        !value.includes("-") &&
        countDecimal(value) <= 18
      ) {
        bondMoreValidations(e, setErrMsg, bondedBalance?.bondedAmount);
        if (genesisLocked && Number(value) > maxUnbondable) {
          setErrMsg((prev) => ({
            ...prev,
            amount: `Only ${toFixed(maxUnbondable, 7)} ${CURRENCY} is unbondable. ${minStake.toLocaleString()} ${CURRENCY} stays locked for genesis validators until ${lockDays} days from activation (${daysRemaining} day(s) remaining).`,
          }));
        }
        let val = removeZero(e.target.value);
        setUnboundAmt(val);
      }
    }
    if (name === "Mnemonics") {
      bondMoreValidations(e, setErrMsg);
      setMnemonics(value);
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <BondWrapper>
      <div className="bond-wrapper">
        <Typography className="bond-wrapper__title">
          <BackButton onClick={() => navigate(-1)} title={<BackIcon />} />
          Unbond Funds
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="17px"
          mb="26px"
        >
          <Typography className="fundAvail">
            <span>Funds Available To Unbond:</span>{" "}
            {genesisLocked
              ? toFixed(maxUnbondable, 7)
              : bondedBalance?.bondedAmount / 10 ** 18}
          </Typography>
        </Box>
        {genesisLocked && (
          <Typography className="fundAvail" sx={{ mb: "20px", opacity: 0.8 }}>
            As a genesis validator, {minStake.toLocaleString()} {CURRENCY} of
            your stake is locked for {lockDays} days from activation (
            {daysRemaining} day(s) remaining). Only the amount above this
            minimum can be unbonded until then.
          </Typography>
        )}
        <div className="bond-wrapper__amount" style={{ marginBottom: "30px" }}>
          {/* Enter Unbonding Amount */}
          <TextField
            label="Unbond amount"
            placeholder="Enter amount to unstake"
            name="Unbond_Amount"
            paddingRight={150}
            helperText={`Funds unbonded will be available for withdrawal after the completion of the Unbonding Period which is ${UNBONDING_PERIOD}`}
            onChange={handleChange}
            autoComplete="off"
            value={unBoundAmt}
          />
          {errMsg?.amount?.length > 0 && (
            <p style={{ color: "red", marginTop: "-1px" }}>{errMsg?.amount}</p>
          )}
          {/* Button for getting available unbonding amount */}

          <Button variant="contained" className="maxBtn" onClick={maxUnbond}>
            Unbond All
          </Button>
        </div>
        {walletType === WALLET_TYPE.NO_WALLET && (
          <div className="bond-wrapper__amount" style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "30px" }}>
              <TextField
                type="password"
                label="Enter mnemonics to authorize the transaction"
                placeholder="Paste or enter your mnemonics"
                name="Mnemonics"
                onChange={handleChange}
                autoComplete="off"
                value={mnemonics}
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

        <CommonBtn
          children="Sign and Submit"
          onClick={onSubmit}
          color="primary"
          disabled={isDisable}
        />
      </div>
    </BondWrapper>
  );
};

export default UnBond;
