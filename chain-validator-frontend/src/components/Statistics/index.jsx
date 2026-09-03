/*eslint-disable*/
import { Box, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CalendarIcon from "../../assets/Icons/CalendarIcon";
import InfoIcon from "../../assets/Icons/InfoIcon";
import MarketCapIcon from "../../assets/Icons/MarketCapIcon";
import PriceIcon from "../../assets/Icons/PriceIcon";
import SupplyIcon from "../../assets/Icons/SupplyIcon";
import { APP_NAME, CURRENCY, DECIMAL } from "../../constants";
import { getApy, getTotalValidators, setApr } from "../../redux/reducer/auth";
import getAllStats from "../../services/apis/getStatistics";
import getPrice from "../../services/getPrice";
import {
  formatMillionNumber
} from "../../utils/commonFunctions";
import { toFixed } from "../../utils/toFixed";
import { StatItem, Wrapper } from "./styles";

const Statistics = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({});
  const [statsStatus, setStatsStatus] = useState("Init");
  const [price, setPrice] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatsStatus("Fetching");
        let data = (await getAllStats())?.data;
        
        setStats(data);
        console.log(data);
        dispatch(getApy(data?.apy ? data?.apy : ""));
        dispatch(setApr(data?.apr ? data?.apr : ""));
        dispatch(getTotalValidators(data?.totalValidator));
        setStatsStatus("Success");
      } catch (err) {
        setStatsStatus("Error");
        return err;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      let response = await getPrice();
      setPrice(response?.data);
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <Wrapper>
      <StatItem style={{ position: "relative" }}>
        <div className="icon-wrap fourthbg">
          <MarketCapIcon />
        </div>
        <Box ml="10px" className="title_warp">
          <Typography variant="h6" color="text.secondary">
            Market Cap
          </Typography>
          <Tooltip
            className="tooltip-common top-right"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                The total market value of the circulating {CURRENCY} supply.
                <br />
                Market cap = Current price x Circulating supply
              </Typography>
            }
          >
            <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
          </Tooltip>
          <div className="supply-wrap">
            <Typography variant="h3" title={stats?.marketCap} style={{ fontWeight: 400 }}>
              {statsStatus === "Init" || statsStatus === "Fetching" ? (
                <Skeleton variant="circle" width={100} height={20} />
              ) : (
                <>
                  $
                  {stats?.circulation_supply
                    ? formatMillionNumber(
                      Number(stats?.circulation_supply) * Number(price)
                    )
                    : 0}
                </>
              )}
            </Typography>
          </div>
        </Box>
      </StatItem>

      <StatItem style={{ position: "relative" }}>
        <div className="icon-wrap secondbg icon-large">
          <PriceIcon />
        </div>

        <Box ml="10px" className="title_warp">
          <Typography variant="h6" color="text.secondary">
            {/* {APP_NAME}  */}
             THEO  Price

          </Typography>
          <Tooltip
            className="tooltip-common top-right"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                The current market price of {APP_NAME} coin in USD.
              </Typography>
            }
          >
            <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
          </Tooltip>
          <Typography variant="h3" title={stats?.tokenPrice} style={{ fontWeight: 400 }}>
            {statsStatus === "Init" || statsStatus === "Fetching" ? (
              <Skeleton variant="circle" width={100} height={20} />
            ) : (
              <>$ {price ? toFixed(Number(price), 6) : "0"}</>
            )}
          </Typography>
        </Box>
      </StatItem>


      {/* <StatItem style={{ position: "relative" }}>
        <div className="icon-wrap fourthbg">
          <CalendarIcon />
        </div>

        <Box ml="10px" className="title_warp">
          <Typography variant="h6" color="text.secondary">
            APY

          </Typography>
          <Tooltip
            className="tooltip-common top-right"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                The average annual percentage yield (APY) earned by network stakers for staking their {CURRENCY}.
              </Typography>
            }
          >
            <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
          </Tooltip>
          <Typography variant="h3" style={{ fontWeight: 400 }}>
            {statsStatus === "Init" || statsStatus === "Fetching" ? (
              <Skeleton variant="circle" width={100} height={20} />
            ) : (
              <>{stats?.apy ? toFixed(stats?.apy, 3) : 0}%</>
            )}
          </Typography>
        </Box>

      </StatItem> */}

        <StatItem style={{ position: "relative" }}>
        <div className="icon-wrap fourthbg">
          <CalendarIcon />
        </div>

        <Box ml="10px" className="title_warp">
          <Typography variant="h6" color="text.secondary">
            APR

          </Typography>
          <Tooltip
            className="tooltip-common top-right"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                The estimated annual percentage rate (APR) earned by network stakers for staking their {CURRENCY}.
              </Typography>
            }
          >
            <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
          </Tooltip>
          <Typography variant="h3" style={{ fontWeight: 400 }}>
            {statsStatus === "Init" || statsStatus === "Fetching" ? (
              <Skeleton variant="circle" width={100} height={20} />
            ) : (
              <>{stats?.apr ? toFixed(stats?.apr, 3) : 0}%</>
              // <>20 %</>
            )}
          </Typography>
        </Box>

      </StatItem>



      <StatItem style={{ position: "relative" }}>
        <div className="icon-wrap fifthbg">
          <SupplyIcon />
        </div>
        <Box ml="10px" className="title_warp">
          <Typography variant="h6" color="text.secondary">
            Total Supply

          </Typography>
          <Tooltip
            className="tooltip-common top-right"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                Total {CURRENCY} that will ever exist in the network.
              </Typography>
            }
          >
            <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
          </Tooltip>
          <div className="supply-wrap" title={stats?.totalSupply}>
            <Typography variant="h3" style={{ fontWeight: 400 }}>
              {statsStatus === "Init" || statsStatus === "Fetching" ? (
                <Skeleton variant="circle" width={100} height={20} />
              ) : (
                <>
                  
                  {stats?.totalSupply
                    ? formatMillionNumber(
                      stats?.totalSupply / 10 ** Number(DECIMAL)
                    )
                    : 0}{" "}
                </>
              )}
            </Typography>
          </div>
        </Box>
      </StatItem>
    </Wrapper>
  );
};

export default Statistics;
