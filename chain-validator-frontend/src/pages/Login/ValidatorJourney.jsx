import React from 'react'
import { ValidatorJourneyBox } from './styles';
import { CURRENCY } from '../../constants';
import { CoinsIcon, GlobeIcon, LayoutDashboardIcon, LockIcon, MonitorIcon, RocketIcon, ShieldIcon, TrendingUpIcon, UserCircleIcon, WalletLoginIcon } from '../../assets/Icons/SvgIcon';

function ValidatorJourney() {
    return (
        <ValidatorJourneyBox>
            <div className="bg-effect-1"></div>
            <div className="bg-effect-2"></div>

            <div className="header-section">
                <div className="process-badge">
                    The Process
                </div>
                <h3 className="main-title">
                    Autheo Validator Journey
                </h3>
                <p className="description">
                    A streamlined, trustless 3-step process to run a validator node and participate in Autheo consensus.
                </p>
            </div>

            <div className="grid-container">
                {/* Connecting Lines for Desktop */}
                <div className="connecting-lines">
                    <div className="shimmer"></div>
                </div>

                {/* Step 1 */}
                <div className="step-card mt-0 step-1">
                    <div className="top-gradient"></div>

                    <div className="icon-container">
                        <MonitorIcon />
                    </div>
                    <div className="text-center-wrapper">
                        <span className="step-badge">Step 1</span>
                        <h4 className="step-title">
                            Connect Node<br />& Wallet
                        </h4>
                    </div>
                    <ul className="list-container">
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <WalletLoginIcon />
                            </div>
                            <span className="list-text">Enter Node</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <ShieldIcon />
                            </div>
                            <span className="list-text">Connect Wallet</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <LayoutDashboardIcon />
                            </div>
                            <span className="list-text">Enter Dashboard</span>
                        </li>
                    </ul>
                </div>

                {/* Step 2 */}
                <div className="step-card step-2">
                    <div className="top-gradient"></div>

                    <div className="icon-container">
                        <UserCircleIcon />
                    </div>
                    <div className="text-center-wrapper">
                        <span className="step-badge">Step 2</span>
                        <h4 className="step-title">
                            Configure Validator<br />Node
                        </h4>
                    </div>
                    <ul className="list-container">
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <UserCircleIcon />
                            </div>
                            <span className="list-text">Create Public Profile</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <GlobeIcon />
                            </div>
                            <span className="list-text">Add Website & Info</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <LockIcon />
                            </div>
                            <span className="list-text">Set Commission Rates</span>
                        </li>
                    </ul>
                </div>

                {/* Step 3 */}
                <div className="step-card step-3">
                    <div className="top-gradient"></div>

                    <div className="icon-container">
                        <CoinsIcon />
                    </div>
                    <div className="text-center-wrapper">
                        <span className="step-badge">Step 3</span>
                        <h4 className="step-title">
                            Stake {CURRENCY}<br />& Activate
                        </h4>
                    </div>
                    <ul className="list-container">
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <CoinsIcon />
                            </div>
                            <span className="list-text">Bond Minimum {CURRENCY}</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg">
                                <TrendingUpIcon />
                            </div>
                            <span className="list-text">Authorize</span>
                        </li>
                        <li className="list-item">
                            <div className="list-icon-bg go-live">
                                <RocketIcon />
                            </div>
                            <span className="list-text go-live">Go Live!</span>
                        </li>
                    </ul>
                </div>
            </div>
        </ValidatorJourneyBox>
    )
}

export default ValidatorJourney