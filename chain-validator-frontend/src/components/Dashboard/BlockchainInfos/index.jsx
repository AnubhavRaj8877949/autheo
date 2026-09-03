/*eslint-disable */
import Card from "../../Common/Card";
import { Container } from "./styles";
import { useSelector } from "react-redux";
import BlocksIcon from "../../../assets/Icons/BlocksIcon";
import ValidatorsNewIcon from "../../../assets/Icons/ValidatorsNewIcon";
import getDashboardWidgets from "../../../services/apis/getDashboardWidgets";
import { useEffect, useState } from "react";
import {
  formatMillionNumber,
  noExponential,
} from "../../../utils/commonFunctions";
import {
  DelegatorStake,
  TotalReward,
  BlockProposed,
  SelfStake,
  BlockIcon,
} from "../../../assets/Icons/SvgIcon.jsx";
import { toFixed } from "../../../utils/toFixed";
import { CURRENCY } from "../../../constants";
import { IconButton, Tooltip, Typography } from "@mui/material";
import InfoIcon from "../../../assets/Icons/InfoIcon";

const BlockchainInfos = () => {
  const { userAddress, isTx } = useSelector((state) => state.auth);
  const [widgets, setWidgets] = useState({});
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userAddress) {
          const response = await getDashboardWidgets(userAddress);
          setLoading(false);
          setWidgets(response?.data);
        }
      } catch (err) {
        setLoading(false);
        return err;
      }
    };
    fetchData();
  }, [userAddress, isTx]);

  const titles = [
    {
      title: "Last Block Proposed",
      icon: <BlockIcon />,
      tooltipContent: "The most recent block successfully proposed by your validator.",
      data: widgets?.lastBlockProposed ? (
        <span title={widgets?.lastBlockProposed} style={{ cursor: "pointer" }}>
          {formatMillionNumber(widgets?.lastBlockProposed)}
        </span>
      ) : (
        "0"
      ),
    },
    {
      title: "No. of Delegators",
      icon: <ValidatorsNewIcon />,
      tooltipContent: "The total number of users currently delegating their tokens to your validator.",
      data: widgets?.delegatorCount ? (
        <span title={widgets?.delegatorCount} style={{ cursor: "pointer" }}>
          {widgets?.delegatorCount}
        </span>
      ) : (
        "0"
      ),
    },
    {
      title: "Total Delegators Stake Amount",
      icon: <DelegatorStake />,
      tooltipContent: "The total amount of tokens delegated to your validator by other users.",
      data: widgets?.delegatorStake ? (
        <span
          title={noExponential((widgets?.delegatorStake - Number(widgets?.selfStake)) / 10 ** 18)
          }
          style={{ cursor: "pointer" }}
        >
          {
            formatMillionNumber(
              noExponential((widgets?.delegatorStake - Number(widgets?.selfStake)) / 10 ** 18)
            )}{" "}
          {(CURRENCY || "").toLocaleUpperCase()}
        </span >
      ) : (
        "0"
      ),
    },
    {
      title: "Total Rewards",
      icon: <TotalReward />,
      tooltipContent: "The total rewards earned by your validator from block validation and network participation.",
      data: widgets?.totalRewards ? (
        <span
          title={noExponential(widgets?.totalRewards)}
          style={{ cursor: "pointer" }}
        >
          {formatMillionNumber(noExponential(widgets?.totalRewards))}
        </span>
      ) : (
        "0"
      ),
    },
    {
      title: "No. of Blocks Proposed",
      icon: <BlockProposed />,
      tooltipContent: "The total number of blocks successfully proposed by your validator.",
      data: widgets?.totalBlockProposed ? (
        <span title={widgets?.totalBlockProposed} style={{ cursor: "pointer" }}>
          {formatMillionNumber(widgets?.totalBlockProposed)}
        </span>
      ) : (
        "0"
      ),
    },
    {
      title: "Self Stake",
      icon: <SelfStake />,
      tooltipContent: "The amount of tokens you have personally staked in your validator node. A higher self stake reflects stronger commitment to the network.",
      data: widgets?.selfStake ? (
        <span
          title={noExponential(widgets?.selfStake / 10 ** 18)
          }
          style={{ cursor: "pointer" }}
        >
          {formatMillionNumber(noExponential(widgets?.selfStake / 10 ** 18))}{" "}
          {(CURRENCY || "").toUpperCase()}
        </span >
      ) : (
        "0"
      ),
    },
  ];

  return (
    <Container>
      {titles?.map((item) => (
        <Card
          key={item?.title}
          title={item?.title}
          icon={item?.icon}
          tooltipContent={item?.tooltipContent}
          value={item?.data}
          loading={loading}
        />
      ))}
    </Container>
  );
};

export default BlockchainInfos;
