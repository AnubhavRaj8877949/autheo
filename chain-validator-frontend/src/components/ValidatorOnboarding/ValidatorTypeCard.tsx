import React from 'react';
import { ValidatorTypeCardProps, ValidatorType } from '../../types/validatorOnboarding';
// @ts-ignore
import { CrownSvg, CheckCircleSvg, CheckmarkSvg } from '../../assets/Icons/SvgIcon';

const ValidatorTypeCard: React.FC<ValidatorTypeCardProps> = ({
  config,
  isSelected,
  isDisabled,
  onSelect,
}) => {
  const handleChange = () => { if (!isDisabled) onSelect(config.type); };

  const isGenesis = config.type === ValidatorType.GENESIS;
  const typeKey  = isGenesis ? 'genesis' : 'regular';
  const active   = isSelected && !isDisabled;

  return (
    <label
      className={[
        'vo-card',
        `vo-card--${typeKey}`,
        active        ? 'is-selected'      : '',
        isDisabled    ? 'vo-card--disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      <input
        type="radio"
        name="vo-validator-type"
        value={config.type}
        checked={active}
        disabled={isDisabled}
        onChange={handleChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <div className="vo-card__header">
        <div className="vo-card__title-wrap">
          {isGenesis && (
            <CrownSvg className="vo-card__icon vo-card__icon--genesis" />
          )}
          <h3 className="vo-card__title">{config.label}</h3>
          {isGenesis  && (
            <span className="vo-card__badge">EXCLUSIVE</span>
          )}
        </div>

        <span className="vo-card__radio" aria-hidden="true">
          <CheckmarkSvg />
        </span>
      </div>

      <p className="vo-card__subtitle">{config.tagline}</p>

      <ul className="vo-card__list" aria-label={`${config.label} features`}>
        {config.features.map((feature) => (
          <li key={feature} className="vo-card__item">
            <CheckCircleSvg
              className={`vo-card__check vo-card__check--${typeKey}`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </label>
  );
};

export default ValidatorTypeCard;
