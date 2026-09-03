const { TextEncoder, TextDecoder } = require('util');

process.env.REACT_APP_EXPLORER_API_URL = "https://evm-backend.example.com/api/"
process.env.REACT_APP_EXPLORER_NAVIGATION_URL = "https://testnet-explorer.example.com/"
process.env.REACT_APP_VALIDATOR_API = "https://native-api.example.com/api"
process.env.REACT_APP_NAME = "Autheo"
process.env.REACT_APP_CURRENCY = "THEO"
process.env.REACT_APP_DECIMAL = 18
process.env.REACT_APP_DENOM = "aauth"
process.env.REACT_APP_MIN_STAKE_AMOUNT = 100
process.env.REACT_APP_FEE_DEDUCTION = 0.00002
process.env.REACT_APP_JAIL_TIME = 10
process.env.REACT_APP_UNBONDING_PERIOD = "21 days"
process.env.REACT_APP_GAS_PRICE = 1500000000000
process.env.REACT_APP_TENDERMINT_URL = "https://tendermint.example.com/"
process.env.REACT_APP_USER_GUIDE_URL = "https://docs.autheo.com"
process.env.REACT_APP_GAS_PRICE = 1500000000000

// process.env.REACT_APP_DEACTIVATION_TIME = 30 minutes
process.env.REACT_APP_ADDRESS_PREFIX = "autheo"
process.env.REACT_APP_PRIVACY_POLICY_URL = "https://legal.autheo.com/legal-agreements/privacy-policy"
process.env.REACT_APP_TERMS_OF_SERVICE_URL = "https://legal.autheo.com/legal-agreements/terms-of-service"
process.env.REACT_APP_VALIDATOR_APP_URL = "https://validator-testnet.example.com/login"
process.env.REACT_APP_DELEGATOR_APP_URL = "https://delegator-testnet.example.com/login"
process.env.REACT_APP_IDE_URL = "https://ide.example.com"

process.env.REACT_APP_OFFICIAL_WEB_URL = "https://www.autheo.com"
process.env.REACT_APP_NETWORK_DOCS_URL = "https://docs.autheo.com/start-here/autheo-os-model"
process.env.REACT_APP_DOCS_URL = "https://docs.autheo.com"
process.env.REACT_APP_GITHUB_URL = "https://github.com/autheo-website"
process.env.REACT_APP_SOCIAL_TWITTER = "https://x.com/Autheo_Network"
process.env.REACT_APP_SOCIAL_LINKEDIN = "https://www.linkedin.com/company/autheo"
process.env.REACT_APP_SOCIAL_INSTAGRAM = "https://www.instagram.com/autheo"
process.env.REACT_APP_SOCIAL_TIKTOK = "https://www.tiktok.com"
process.env.REACT_APP_SOCIAL_TELEGRAM = "https://t.me/Autheo_Official"
process.env.REACT_APP_SOCIAL_DISCORD = "https://discord.com/invite/autheo-1281920825309532233"
process.env.REACT_APP_SOCIAL_YOUTUBE = "https://www.youtube.com/@Autheo_Network"
process.env.REACT_APP_SOCIAL_CMC = "https://coinmarketcap.com/currencies/autheo/"


Object.assign(global, { TextDecoder, TextEncoder });
import '@testing-library/jest-dom';

import 'jest-styled-components';