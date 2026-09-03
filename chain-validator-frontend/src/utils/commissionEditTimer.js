export function isOptionDisable(activationDate, validityPeriodDays) {
  const activationDateObj = new Date(activationDate);
  const expirationDate = new Date(activationDateObj);
  expirationDate.setDate(activationDateObj.getDate() + validityPeriodDays);
  const currentDate = new Date();
  return currentDate <= expirationDate;
}

export function isOptionDisableInMinutes(
  activationDate,
  validityPeriodMinutes
) {
  const activationDateObj = new Date(activationDate);
  const expirationDate = new Date(activationDateObj);
  new Date(
    expirationDate.setMinutes(
      activationDateObj.getMinutes() + Number(validityPeriodMinutes)
    )
  );
  const currentDate = new Date();
  return currentDate <= expirationDate;
}
