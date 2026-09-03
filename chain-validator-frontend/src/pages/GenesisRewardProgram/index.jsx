/*eslint-disable*/
import { Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Card from "../../components/Common/Card";
import InflationIcon from "../../assets/Icons/InflationIcon";
import './style.scss';
import GenesisRewardTable from "./GenesisRewardTable";
import { BlockValidationIcon, RewardIcon, ValidationIcon } from "../../assets/Icons/SvgIcon";
import { useSelector, useDispatch } from "react-redux";
import { hideGenesisAbout } from "../../redux/reducer/localData";
import { JsonRpcSigner, BrowserProvider, JsonRpcProvider } from "ethers";
import { GenesisFactory, SignerWrapper } from "../../clients/chain/evm";
import { CHAIN_ID, ChainConfig, CURRENCY, EVM_RPC, WALLET_TYPE, ZERO_ADDR } from "../../constants";
import { toast } from "../../components/Common/Toast/Toast";
import { ExceptionParser } from "../../internal/exception-parser";
import graphqlClient from "../../clients/graphql";
import { FETCH_VESTING_STATS, FETCH_FUNDS_RELEASE_EVENTS } from "../../clients/graphql/queries";
import { usePagination } from "../../hooks/usePagination";
import { DEFAULT_TABLE_LIMIT } from "../../constants";
import { formatMillionNumber, noExponential } from "../../utils/commonFunctions";
import Loader from "../../components/Loader/Loader";
import getDashboardWidgets from "../../services/apis/getDashboardWidgets";


const RewardProgramStatsCard = [
  {
    title: "Total airdrops received",
    value: "0",
    icon: <BlockValidationIcon />,
    tooltipContent: "Number of airdrops received",
    key: "vestingAirdropsReceived",
    isCurrency: false,
  },
  {
    title: "Block validation rewards",
    value: "0",
    icon: <ValidationIcon />,
    tooltipContent: "Rewards from validator participation",
    key: "rewardsEarnedFromValidation",
    isCurrency: true,
  },
  {
    title: "Genesis rewards",
    value: `0.00 ${CURRENCY}`,
    icon: <RewardIcon />,
    tooltipContent: "Rewards from genesis airdrop",
    key: "rewardsEarnedFromGenesisAirdrop",
    isCurrency: true
  },
  {
    title: "Total rewards",
    value: `0.00 ${CURRENCY}`,
    icon: <InflationIcon />,
    tooltipContent: "Total rewards earned from validator participation and genesis airdrop",
    key: "totalRewardsEarned",
    isCurrency: true
  },
];

const GenesisRewardProgram = () => {
  // const { address, isConnected } = useAppKitAccount();
  // const { walletProvider } = useAppKitProvider('eip155');
  const { isLoggedIn, userEvmAddress, userAddress } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    vestingAirdropsReceived: 0,
    rewardsEarnedFromValidation: 0,
    rewardsEarnedFromGenesisAirdrop: 0,
    totalRewardsEarned: 0,
  });
  const [txnsPaging, setTxnsPaging] = useState({ txns: [] });
  const [txStatus, setTxStatus] = useState("Init");
  const [isLoading, setLoading] = useState(false);
  const [isVestingInitiated, setIsVestingInitiated] = useState(false);
  const { pageParams, handlePageChange, totalPages, setTotalCount } =
    usePagination();

  const { isGenesisAboutVisible } = useSelector((state) => state.localData || {});
  const dispatch = useDispatch();


  const handleCloseAboutSection = () => {
    dispatch(hideGenesisAbout());
  };

  useEffect(() => {
    (async () => {
      if (userEvmAddress) {
    
        const genesisFactory = new GenesisFactory(new JsonRpcProvider(EVM_RPC));
        setLoading(true)
        const result = await genesisFactory.checkInitiationStatus(userEvmAddress);

        if (result.ok) {
          if (result.data.data !== ZERO_ADDR) {
            setIsVestingInitiated(true);
            const [genesisRewardStats, stakingStats] = await Promise.all([
              graphqlClient.query(FETCH_VESTING_STATS, { beneficiaryAddress: userEvmAddress }),
              getDashboardWidgets(userAddress)]);


            if (stakingStats || genesisRewardStats.ok) {
              const fund = genesisRewardStats.ok ? genesisRewardStats.data.data.beneficiaryFund : null;
              const genesisRewards = fund ? (Number(fund.totalAmount) || 0) : 0;
              const valRewards = stakingStats ? Number(stakingStats.data.totalRewards || 0) * 1e18 : 0;

              setStats({
                vestingAirdropsReceived: fund ? (fund.releaseCount || 0) : 0,
                rewardsEarnedFromGenesisAirdrop: genesisRewards,
                rewardsEarnedFromValidation: valRewards,
                totalRewardsEarned: genesisRewards + valRewards,
              });
            }

          }
        } else {
          toast.error("Something went wrong while fetching vesting status");
        }
        setLoading(false);
      }
    })();
    return () => GenesisFactory.destroyInstance();
  }, []);


  useEffect(() => {
    if (userEvmAddress && isVestingInitiated) {
      const fetchTransactions = async () => {
        setTxStatus("Fetching");
        const skip = (pageParams.page - 1) * DEFAULT_TABLE_LIMIT;

        const response = await graphqlClient.query(FETCH_FUNDS_RELEASE_EVENTS, {
          beneficiaryAddress: userEvmAddress,
          skip: skip,
          first: DEFAULT_TABLE_LIMIT,
          orderBy: "timestamp",
          orderDirection: "desc"
        });

        if (response.ok) {
          const events = response.data.data.fundsReleaseEvents || [];
          setTxnsPaging({ txns: events });

          const _totalAirdrops = Number(stats.vestingAirdropsReceived);
          setTotalCount(_totalAirdrops);

          setTxStatus("Success");
        } else {
          setTxStatus("Error");
        }
      };

      setLoading(true);
      fetchTransactions();
      setLoading(false);
    }
  }, [userEvmAddress, isVestingInitiated, pageParams.page, stats.vestingAirdropsReceived]);


  const handleVestingInitiation = async () => {
    try {

      
      const rawSigner = new SignerWrapper(window.keplr, WALLET_TYPE.KEPLR, ChainConfig.chainId, userEvmAddress);
      const genesisFactory = GenesisFactory.getInstance();
      genesisFactory.initRawSigner(rawSigner, userEvmAddress);
      setLoading(true);

      const result = await genesisFactory.initiateVesting();

      if (result.ok) {
        const { data } = result.data;
        if (data.status === 0) {
          toast.error("Transaction failed, please try again.");
          setLoading(false);
          return;
        }

        setIsVestingInitiated(true);
        toast.success("Vesting initiated.");
      } else {
        const rawError = result.exception?.internal;
        console.error("initiateVesting failed:", rawError);
        const code = ExceptionParser.parseWalletException(rawError);
        toast.error(ExceptionParser.getMessage(code));
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("initiateVesting threw:", err);
      const code = ExceptionParser.parseWalletException(err);
      toast.error(ExceptionParser.getMessage(code));
    }
  }


  return (<>
    {isLoading ? <Loader /> : (
      <div>
        <Typography
          variant="h3"
          mb={2.5}
          style={{ marginBottom: "8px" }}
        >
          Genesis Reward Program
        </Typography>

        {isGenesisAboutVisible !== false && (
          <div className="genesis-about-section" style={{ position: "relative" }}>
            {isVestingInitiated && (
              <button
                onClick={handleCloseAboutSection}
                className="absolute transition-all hover:scale-110"
                style={{
                  background: 'rgba(255, 107, 107, 0.15)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  cursor: 'pointer',
                  zIndex: 10,
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            <div className="genesis-about-section__content">
              <Typography variant="h3" mb={2}>
                About Genesis Airdrop
              </Typography>
              <Typography variant="body2" style={{ color: "#9ca3af" }}>
                To start receiving your Genesis rewards, you'll need to complete a
                one-time "Initiate Reward" transaction. This sets up an automated
                system that securely distributes your earned rewards every 30 days,
                based on your network uptime and overall contribution.
              </Typography>
            </div>

            {isVestingInitiated &&
              (<> <button className="genesis-initiate-btn active-state" disabled>
                <div className="genesis-initiate-btn__icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div className="genesis-initiate-btn__text">
                  <strong>ACTIVE</strong>
                  <span>VESTING CONTRACT DEPLOYED</span>
                </ div>
              </button>
              </>)}

            {!isVestingInitiated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="genesis-initiate-btn" onClick={handleVestingInitiation} >
                  <div className="genesis-initiate-btn__icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div className="genesis-initiate-btn__text">
                    <strong>INITIATE VESTING</strong>
                    <span>DEPLOY VESTING CONTRACT</span>
                  </ div>
                </button>
                {/* <button
                  onClick={() => walletConnectHandler.open()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50px',
                    width: '54px',
                    height: '54px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  className="hover:scale-110"
                  title="Manage Wallet"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
                  </svg>
                </button> */}
              </div>)}

            {/* {!isConnected && !isVestingInitiated && (
              <button className="genesis-initiate-btn" onClick={() => walletConnectHandler.open()}>
                <div className="genesis-initiate-btn__icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="genesis-initiate-btn__text">
                  <strong>CONNECT WALLET</strong>
                  <span>TO INITIATE VESTING</span>
                </ div>
              </button>)} */}

          </div >
        )}

        {
          isVestingInitiated && (<>
            <Typography
              variant="body2"
              style={{ marginBottom: "20px", color: "var(--theme-text-secondary, #9ca3af)" }}
            >
              Track your early-stage participation rewards, validator bonuses, and genesis airdrop allocations.
            </Typography>
            <div className="genesis-reward-cards">
              {RewardProgramStatsCard.map((item) => (
                <>
                  <Card
                    key={item.key}
                    title={item.title}
                    value={item.isCurrency ? <Tooltip placement="top" arrow title={`${noExponential(Number(stats[item.key]) / 10 ** 18)} ${CURRENCY}`}>{`${formatMillionNumber(Number(stats[item.key]) / 10 ** 18)} ${CURRENCY}`}</Tooltip> : stats[item.key]}
                    icon={item.icon}
                    tooltipContent={item.tooltipContent}
                    loading={false}
                  />
                </>
              ))}
            </div>

            <div style={{ marginTop: "40px" }}>
              <Typography variant="h3" mb={3}>
                Genesis Rewards Airdrop History
              </Typography>
              <GenesisRewardTable txnsPaging={txnsPaging} txStatus={txStatus}
                totalPages={totalPages} handlePageChange={handlePageChange}
                pageParams={pageParams} setTotalCount={setTotalCount} showAll={true} />
            </div>
          </>)
        }
      </div >
    )}
  </>);
};

export default GenesisRewardProgram;
