/* eslint-disable */
import { Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FormWrapper from "../Common/FormWrapper";
import { useEffect, useState } from "react";
import BackButton from "../BackButton/BackButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import fetchPubKey from "../../services/fetchPubKey";
import { useGetNodeUrl } from "../../context/NodeUrl";
import { createValidatorInput, editValidatorInput, EXPLORER } from "../../constants";
import { handleNext } from "../../utils/validatorValidations";
import CommonBtn from "../Common/CommonBtn/CommonBtn.jsx";
import { BackIcon } from "../../assets/Icons/SvgIcon";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const FirstStep = ({
  primaryValues,
  setPrimaryValues,
  setActiveStep,
  activeStep,
  methodType,
  hideCommissionField,
  profileData,
}) => {
  const [currectCommissionRate, setCurrectCommissionRate] = useState("");
  const [prevCommissionRate, setPrevCommissionRate] = useState(0);
  const navigate = useNavigate();
  const { nodeUrl } = useGetNodeUrl();
  let regex = /^[a-zA-Z\s]*$/;
  const goBack = () => {
    navigate(-1);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchPubKey(nodeUrl);
        const pub_key = res?.result?.validator_info?.pub_key?.value;
        localStorage.setItem("publicKey", pub_key);
      } catch (err) {
        return err;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let decimalRate;
    if (methodType === "editValidator" && profileData?.commissionRate != null) {
      decimalRate = Number(profileData.commissionRate);
    } else {
      decimalRate = Number(primaryValues?.CommissionRate ?? 0);
    }
    const percentRate = Number.isFinite(decimalRate)
      ? (decimalRate * 100).toString()
      : "";
    setCurrectCommissionRate(percentRate);
    setPrevCommissionRate(decimalRate);
  }, [methodType, profileData?.commissionRate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/\s+/g, " ");

    if (
      name !== "CommissionRate" &&
      name !== "website" &&
      name !== "securityContact"
    ) {
      if (regex.test(value)) {
        setPrimaryValues((prevValue) => ({
          ...prevValue,
          [name]: sanitizedValue,
        }));
      } else if (name === "identity") {
        const sanitizedValue = value.replace(/\s+/g, " ");
        setPrimaryValues((prevValue) => ({
          ...prevValue,
          [name]: sanitizedValue,
        }));
      }
    } else {
      if (name === "CommissionRate") {
        if (value === "") {
          setCurrectCommissionRate("");
          setPrimaryValues((prev) => ({
            ...prev,
            CommissionRate: 0,
          }));
          return;
        }
        if (!/^\d*\.?\d*$/.test(value)) return;

        const normalized = value === "." ? "0." : value;
        const numeric = parseFloat(normalized);

        if (Number.isNaN(numeric)) {
          setCurrectCommissionRate(normalized);
          return;
        }

        const isEditMode = methodType === "editValidator";
        const minPercent = isEditMode
          ? Number(prevCommissionRate ?? 0) * 100
          : 0;
        const maxPercent = isEditMode
          ? minPercent + Number(primaryValues?.commissionMaxChangeRate ?? 0) * 100
          : 100;
        setCurrectCommissionRate(value);
        const isIncompleteDecimal = value.endsWith(".");
        if (!isIncompleteDecimal && Number.isFinite(numeric)) {
          if (numeric < minPercent || numeric > maxPercent) return;
          setPrimaryValues((prev) => ({
            ...prev,
            CommissionRate: numeric / 100,
          }));
        }
        return;
      }
      setPrimaryValues((prevValue) => ({
        ...prevValue,
        [name]: sanitizedValue,
      }));
    }
  };

  const getCommissionRange = () => {
    const isEditMode = methodType === "editValidator";
    const minPercent = isEditMode
      ? Number(prevCommissionRate ?? 0) * 100
      : 0;
    const maxPercent = isEditMode
      ? minPercent + Number(primaryValues?.commissionMaxChangeRate ?? 0) * 100
      : 100;

    return { minPercent, maxPercent };
  };

  const handleCommissionBlur = () => {
    const value = currectCommissionRate;

    if (value === "" || value === ".") {
      const { minPercent } = getCommissionRange();
      setCurrectCommissionRate(minPercent.toString());
      setPrimaryValues((prev) => ({
        ...prev,
        CommissionRate: minPercent / 100,
      }));
      return;
    }

    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) return;

    const { minPercent, maxPercent } = getCommissionRange();
    let clamped = numeric;

    if (numeric < minPercent) clamped = minPercent;
    if (numeric > maxPercent) clamped = maxPercent;
    const shouldUpdate =
      clamped !== numeric ||
      value.endsWith(".") ||
      Number(primaryValues?.CommissionRate ?? NaN) !== clamped / 100;

    if (!shouldUpdate) return;

    setCurrectCommissionRate(clamped.toString());
    setPrimaryValues((prev) => ({
      ...prev,
      CommissionRate: clamped / 100,
    }));
  };

  const { minPercent: commissionMinPercent, maxPercent: commissionMaxPercent } =
    getCommissionRange();

  const isCommissionValid = (() => {
    if (hideCommissionField) return true;
    const value = currectCommissionRate;

    if (value === "" || value === ".") return false;
    if (!/^\d*\.?\d*$/.test(value)) return false;

    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) return false;

    return numeric >= commissionMinPercent && numeric <= commissionMaxPercent;
  })();

  const getFieldDescription = (name) => {
    switch (name) {
      case "name": return "This is the public name that will be shown to delegators in the validator list.";
      case "details": return "Provide a short description about your validator, infrastructure, reliability, or mission.";
      case "website": return "Add your official website link so delegators can learn more about your validator.";
      case "identity": return "Provide a public identity reference (organization name, uPort, Keybase, etc.)";
      case "securityContact": return "This contact will be used for security-related communication regarding your validator node.";
      case "CommissionRate": return "The percentage of delegator rewards your validator keeps.";
      default: return "";
    }
  };

  const getFieldPlaceholder = (name) => {
    switch (name) {
      case "name": return "Enter validator name";
      case "details": return "Enter validator description";
      case "website": return "https://your-website.com";
      case "identity": return "e.g. Keybase: autheo";
      case "securityContact": return "e.g. security@your-node.io";
      default: return "Enter";
    }
  };

  const isEditMode = methodType === "editValidator";

  const explorerValidatorsUrl = EXPLORER ? `${EXPLORER}/validators` : "#";

  return (
    <FormWrapper
      sx={
        isEditMode
          ? {
              ".common-wrapper": {
                maxWidth: "100%",
                maxHeight: "none",
                overflow: "visible",
                padding: "22px 26px 24px",
                "&__title": {
                  marginBottom: "8px",
                  paddingBottom: "8px",
                  fontSize: "20px",
                },
                ".back-btns": { top: "26px", left: "24px" },
                ".MuiInputBase-input": {
                  padding: "12px 14px",
                  fontSize: "14px",
                },
                ".MuiFormHelperText-root": {
                  margin: "4px 0 0",
                  fontSize: "11px",
                },
                ".MuiButton-root": { fontSize: "16px", padding: "9px 20px" },
              },
            }
          : undefined
      }
    >
      <div
        className="common-wrapper"
        style={{ marginTop: isEditMode ? "0" : "20px" }}
      >
        <Typography
          className="common-wrapper__title common-wrapper__title--flex"
        >
          <BackButton onClick={() => navigate(-1)} title={<BackIcon />} />
          {methodType === "createValidator"
            ? "Onboard as a Validator"
            : "Edit Validator Info."}
        </Typography>

        {methodType === "createValidator" && (
          <Typography
            style={{
              fontSize: "16px",
              color: "var(--theme-text-secondary)",
              marginBottom: "24px",
              lineHeight: "1.5",
            }}
          >
            Enter your validator node information. These details are stored
            on-chain and visible to anyone browsing the{" "}
            <a
              href={explorerValidatorsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--brand-primary-text)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Autheo network explorer.
            </a>{" "}
            <span style={{ fontSize: "12px" }}>&#x2197;</span>
          </Typography>
        )}
        {/* ========================================input=============================== */}
        <ThemeProvider theme={darkTheme}>
          <div
            style={
              isEditMode
                ? {
                    display: "grid",
                    gridTemplateColumns: "2fr",
                    rowGap: "2px",
                    alignItems: "start",
                  }
                : undefined
            }
          >
          {methodType == "createValidator"
            ? createValidatorInput?.map((item) => (
              <div className="inputFields" key={item?.id}>
                <label style={{ margin: "0", fontWeight: "600", fontSize: "16px", color: "var(--theme-text-primary)" }}>
                  {item?.label}
                  {item?.required && <span style={{ color: "red", marginLeft: "2px" }}>*</span>}
                </label>
                <p style={{
                  margin: "4px 0 10px 0",
                  fontSize: "16px",
                  color: "var(--theme-text-secondary)",
                  lineHeight: "1.4",
                }}>
                  {getFieldDescription(item?.name)}
                </p>
                {item?.name === "details" ? (<>
                  <textarea
                    id={`field-${item?.name}`}
                    name={item?.name}
                    placeholder={getFieldPlaceholder(item?.name)}
                    value={primaryValues[item?.name] || ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      border: "1px solid var(--theme-border-primary)",
                      backgroundColor: "var(--theme-bg-input)",
                      color: "var(--theme-text-primary)",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </>) : (<>
                  <TextField
                    key={item?.id}
                    placeholder={getFieldPlaceholder(item?.name)}
                    fullWidth
                    value={primaryValues[item?.name]}
                    style={{ marginBottom: "20px" }}
                    id="outlined-basic"
                    name={item?.name}
                    autoComplete="off"
                    variant="outlined"
                    onChange={(e) => handleChange(e)}
                    InputProps={{
                      style: {
                        borderRadius: "15px",
                        backgroundColor: "var(--theme-bg-input)",
                      },
                    }}
                  />
                </>)}


              </div>
            ))
            : editValidatorInput?.map((item) => (
              <div className="inputFields" key={item?.id}>
                <label style={{ margin: "0", fontWeight: "600", fontSize: "14px", color: "var(--theme-text-primary)" }}>
                  {item?.label}
                </label>
                <p style={{
                  margin: "2px 0 6px 0",
                  fontSize: "12px",
                  color: "var(--theme-text-secondary)",
                  lineHeight: "1.35",
                }}>
                  {getFieldDescription(item?.name)}
                </p>

                {item?.name === "details" ? (<>
                  <textarea
                    id={`field-${item?.name}`}
                    name={item?.name}
                    placeholder={getFieldPlaceholder(item?.name)}
                    value={primaryValues[item?.name] || ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    rows={2}
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "10px 14px",
                      marginBottom: "10px",
                      borderRadius: "10px",
                      border: "1px solid var(--theme-border-primary)",
                      backgroundColor: "var(--theme-bg-input)",
                      color: "var(--theme-text-primary)",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </>) : (<>
                  <TextField
                    key={item?.id}
                    fullWidth
                    placeholder={getFieldPlaceholder(item?.name)}
                    multiline={item?.name === "details"}
                    minRows={item?.name === "details" ? 4 : undefined}
                    value={primaryValues[item?.name]}
                    style={{ marginBottom: "10px" }}
                    id="outlined-basic"
                    name={item?.name}
                    autoComplete="off"
                    variant="outlined"
                    onChange={(e) => handleChange(e)}
                    InputProps={{
                      style: {
                        borderRadius: "15px",
                        backgroundColor: "var(--theme-bg-input)",
                      },
                    }}
                  />

                </>)}

              </div>
            ))}
          {hideCommissionField === false && (
            <div className="inputFields">
              <label style={{ margin: "0", fontWeight: "600", fontSize: isEditMode ? "14px" : "15px", color: "var(--theme-text-primary)" }}>
                Commission Rate
              </label>
              <p style={{
                margin: isEditMode ? "2px 0 6px 0" : "4px 0 10px 0",
                fontSize: isEditMode ? "12px" : "16px",
                color: "var(--theme-text-secondary)",
                lineHeight: "1.35",
              }}>
                {getFieldDescription("CommissionRate")}
              </p>

              <TextField
                fullWidth
                value={currectCommissionRate ?? ""}
                style={{ marginBottom: "10px" }}
                id="outlined-basic"
                placeholder="Enter Commission Rate"
                name="CommissionRate"
                autoComplete="off"
                variant="outlined"
                onChange={(e) => handleChange(e)}
                onBlur={handleCommissionBlur}
                inputProps={{
                  step: "0.01",
                  inputMode: "decimal",
                  pattern: "^\\d*\\.?\\d*$",
                }}
                InputProps={{
                  style: {
                    borderRadius: "15px",
                    backgroundColor: "var(--theme-bg-input)",
                  },
                }}
                helperText={
                  primaryValues?.commissionMaxChangeRate
                    ? `You can change the commission rate once within the range of ${commissionMinPercent.toFixed(2).replace(/\.00$/, "")} % - ${commissionMaxPercent.toFixed(2).replace(/\.00$/, "")} %`
                    : ""
                }
              />
            </div>
          )}
          </div>
        </ThemeProvider>
        <div className="commonBtns">
          <CommonBtn
            children="Continue Setup"
            onClick={() => handleNext(primaryValues, activeStep, setActiveStep)}
            disabled={!isCommissionValid}
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default FirstStep;
