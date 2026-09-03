/* eslint-disable */
import React from 'react';
import { Stepper, Step, StepLabel, styled, StepConnector, stepConnectorClasses } from '@mui/material';
import './style.css';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 15,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: 'var(--theme-text-primary)',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: 'var(--theme-text-primary)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: 'var(--theme-text-primary)',
        borderTopWidth: 2,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    color: 'var(--theme-border-card)',
    display: 'flex',
    height: 32,
    alignItems: 'center',
    ...(ownerState.active && {
        color: 'var(--theme-text-primary)',
    }),
    ...(ownerState.completed && {
        color: 'var(--theme-text-primary)',
    }),
    '& .QontoStepIcon-circle': {
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1px solid currentColor',
        backgroundColor: ownerState.active || ownerState.completed ? 'var(--theme-text-primary)' : 'var(--theme-bg-input)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: ownerState.active || ownerState.completed ? 'var(--theme-bg-primary)' : 'var(--theme-text-muted)',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1,
        transition: 'all 0.3s ease',
    },
}));

function QontoStepIcon(props) {
    const { active, completed, className, icon } = props;

    return (
        <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
            <div className="QontoStepIcon-circle">
                {icon}
            </div>
        </QontoStepIconRoot>
    );
}

const CustomStepper = ({ activeStep, steps }) => {
    return (
        <div className="custom-stepper-container">
            <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </div>
    );
};

export default CustomStepper;
