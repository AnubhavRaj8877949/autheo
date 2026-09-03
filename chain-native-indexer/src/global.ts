import Environment from "./environments/environment";
declare global {
  var environment: Environment;
}

export const setGlobalEnvironment = (environment: Environment): void => {
  globalThis.environment = environment;
};
