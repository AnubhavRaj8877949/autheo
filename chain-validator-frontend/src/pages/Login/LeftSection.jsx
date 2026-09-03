import React from 'react';
import { LeftSectionBox } from './styles';
import { TrustlessVerificationIcon } from '../../assets/Icons/TrustlessVerificationIcon';
import { InfrastructurePrerequisitesIcon } from '../../assets/Icons/InfrastructurePrerequisitesIcon';

const LeftSection = () => {
    return (
        <LeftSectionBox>
            {/* Left Column: Context & Info */}
            <div className="left-column">
                <h1 className="title">
                    Initialize Your <br />
                    <span className="highlight">
                        Autheo Validator Node
                    </span>
                </h1>

                <p className="description">
                    Authenticate your deployed node infrastructure with the Autheo network. Once verified, your validator is eligible to take part in transaction verification and block production, and to earn validator rewards.
                </p>

                <div className="features-list">
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <TrustlessVerificationIcon />
                        </div>
                        <div>
                            <h3 className="feature-title">Trustless Verification</h3>
                            <p className="feature-desc">Autheo only queries your node's public RPC endpoint to verify sync status. No private keys or sensitive telemetry are ever requested.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <InfrastructurePrerequisitesIcon />
                        </div>
                        <div>
                            <h3 className="feature-title">Infrastructure Prerequisites</h3>
                            <p className="feature-desc">Your node must be fully synchronized with the current block height and expose a publicly reachable RPC endpoint.</p>
                        </div>
                    </div>
                </div>
            </div>
        </LeftSectionBox>
    );
};

export default LeftSection;
