/*eslint-disable*/
import { useSelector } from "react-redux";
import { StyledBox, StyledTabs, StyledTab } from "./styles";
import "../../../Styles.scss";
function a11yProps(index) {
  return {
    id: `common-tab-${index}`,
    "aria-controls": `common-tabpanel-${index}`,
  };
}

const Tabs = ({ tabId, toggleTabHandler, isDisable }) => {
  const data = useSelector((state) => state?.auth);

  const handleChange = (event, newValue) => {
    if (!isDisable) {
      toggleTabHandler(newValue);
    }
  };

  return (
    <StyledBox>
      <StyledTabs
        value={tabId}
        onChange={handleChange}
        aria-label="common tabs"
      >
        <StyledTab
          className={isDisable ? "disabled" : ""}
          label={`All Validators (${data?.validatorCount?.count ?? 0})`}
          {...a11yProps(0)}
        />
        <StyledTab
          className={isDisable ? "disabled" : ""}
          label={`Active (${data?.validatorCount?.activeCount ?? 0})`}
          {...a11yProps(1)}
        />
        <StyledTab
          className={isDisable ? "disabled" : ""}
          label={`Inactive (${data?.validatorCount?.inactiveCount ?? 0})`}
          {...a11yProps(2)}
        />
        <StyledTab
          className={isDisable ? "disabled" : ""}
          label={`Deactivated (${
            data?.validatorCount?.deactivatingCount ?? 0
          })`}
          {...a11yProps(3)}
        />
      </StyledTabs>
    </StyledBox>
  );
};

export default Tabs;
