/*eslint-disable */
import { TextField, InputAdornment } from "@mui/material";
import Button from "@mui/material/Button";
import { useState, useCallback, useEffect } from "react";
import Tabs from "../../Common/Tabs";
import ValidatorsTable from "./ValidatorsTable";
import { Magnifier } from "../../../assets/Icons/SvgIcon.jsx";
import { Search, TabsSection, InputSearch } from "./styles";

const ValidatorsTableList = () => {
  const [tabId, setTabId] = useState(0);
  const [searchData, setSearchData] = useState("");
  const [searchDisable, setSearchDisable] = useState(true);
  const [isSearch, setIsSearch] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  let regex = /^[A-Za-z0-9\s]*$/;

  const toggleTabHandler = useCallback((_tabId) => {
    setTabId(_tabId);
  }, []);

  const handleSearchChange = (evt) => {
    if (regex.test(evt?.target?.value)) {
      setIsSearch(false);
      const sanitizedValue = evt?.target?.value.replace(/\s+/g, " ");
      setSearchData(sanitizedValue);
    }
  };

  useEffect(() => {
    if (searchData?.length > 0) {
      setSearchDisable(false);
    } else {
      setSearchDisable(true);
      setIsSearch(false);
    }
  }, [searchData]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchData?.length > 0) {
      e.preventDefault();
      setIsSearch(true);
    }
  };

  useEffect(() => {
    if (searchData?.length == 0 && isSearch == false) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [searchData, isSearch]);

  return (
    <>
      <TabsSection>
        <Tabs
          tabId={tabId}
          toggleTabHandler={toggleTabHandler}
          isDisable={isDisable}
        />
        {/* <Search component="form">
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search for an address or name" inputProps={{ "aria-label": "search validator" }} onChange={handleSearchChange} value={searchData || ""} onKeyPress={handleKeyPress} />
          <span onClick={(e) => (e.preventDefault(), setIsSearch(true))} disabled={searchDisable}>
            <img src={magnifier} alt="imgs" />
          </span>
          <Button className={!isDisable ? "disable" : ""} style={{ color: "white" }} onClick={(e) => (e.preventDefault(), setIsSearch(true))} disabled={searchDisable}>
            Search
          </Button>
        </Search> */}
        <InputSearch>
          <TextField
            variant="outlined"
            placeholder="Search for name or address"
            fullWidth
            onChange={handleSearchChange}
            value={searchData || ""}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <div>
                  <InputAdornment position="">
                    <Magnifier />
                  </InputAdornment>
                  {/* <Button className={!isDisable ? "disable" : ""} style={{ color: "white" }} onClick={(e) => (e.preventDefault(), setIsSearch(true))} disabled={searchDisable} onChange={handleSearchChange} value={searchData || ""}>
                    Search
                  </Button> */}
                </div>
              ),
            }}
          />
        </InputSearch>
      </TabsSection>
      <ValidatorsTable
        tabId={tabId}
        searchData={searchData}
        setTabId={setTabId}
        setIsSearch={setIsSearch}
        isSearch={isSearch}
      />
    </>
  );
};

export default ValidatorsTableList;
