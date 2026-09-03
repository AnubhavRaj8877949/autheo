import { Typography } from "@mui/material";
import FormWrapper from "../Common/FormWrapper";
import { CheckCircleSvg, RocketIcon, ShieldIcon } from "../../assets/Icons/SvgIcon";
import "../ValidatorOnboarding/ValidatorOnboarding.scss";
import "./style.css";

/**
 * First screen of validator onboarding: create a brand new validator, or
 * migrate an existing setup across.
 *
 * Reuses the `.vo-card` visual language from the validator-type modal so the
 * two choice surfaces in onboarding look like the same product.
 */
export const ONBOARDING_MODE = {
  NEW: "new",
  MIGRATE: "migrate",
};

const OPTIONS = [
  {
    mode: ONBOARDING_MODE.NEW,
    icon: RocketIcon,
    title: "Create New Validator",
    tagline: "Set up a validator node from scratch.",
    points: [
      "Verify your validator license",
      "Enter your validator details and commission",
      "Stake and activate your node",
    ],
  },
  {
    mode: ONBOARDING_MODE.MIGRATE,
    icon: ShieldIcon,
    title: "Migrate Existing Validator",
    tagline: "Bring a validator you already run onto this app.",
    points: [
      "Provide your secure validator URL",
      "Upload your validator migration file",
      "Confirm with your migration password",
    ],
  },
];

const OnboardingModeChoice = ({ onSelect }) => (
  <FormWrapper>
    <div className="common-wrapper onboarding-choice">
      <Typography className="common-wrapper__title">
        Onboard Validator
      </Typography>

      <Typography className="onboarding-choice__intro">
        Choose how you'd like to get started. You can set up a new validator
        node, or migrate a validator you already run.
      </Typography>

      <div
        className="vo-card-grid"
        role="group"
        aria-label="Validator onboarding options"
      >
        {OPTIONS.map(({ mode, icon: Icon, title, tagline, points }) => (
          <button
            key={mode}
            type="button"
            className="vo-card onboarding-choice__card"
            onClick={() => onSelect?.(mode)}
          >
            <div className="vo-card__header">
              <div className="vo-card__title-wrap">
                <span className="onboarding-choice__icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="vo-card__title">{title}</h3>
              </div>
            </div>

            <p className="vo-card__subtitle">{tagline}</p>

            <ul className="vo-card__list">
              {points.map((point) => (
                <li key={point} className="vo-card__item">
                  <CheckCircleSvg className="vo-card__check" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <span className="onboarding-choice__cta" aria-hidden="true">
              {title} →
            </span>
          </button>
        ))}
      </div>
    </div>
  </FormWrapper>
);

export default OnboardingModeChoice;
