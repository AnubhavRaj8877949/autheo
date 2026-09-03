import { Router } from "express";
import BlockController from "./modules/block/block.controller";
import ExplorerController from "./modules/explorer/explorer.controller";
import DelegatorController from "./modules/delegator/delegator.controller";
import ValidatorController from "./modules/validator/validator.controller";
import TransactionsController from "./modules/transactions/transaction.controller";
import ContractController from "./modules/contract/contract.controller";
import TokenController from "./modules/token/token.controller";
import ProposalController from "./modules/proposal/proposal.controller";

/**
 * Configure api routes
 */
export default function registerRoutes(): Router {
  const router = Router();
  const apiRouter = Router();

  const blockController = new BlockController();
  const delegatorController = new DelegatorController();
  const validatorController = new ValidatorController();
  const explorerController = new ExplorerController();
  const transactionsController = new TransactionsController();
  const contractController = new ContractController();
  const tokenController = new TokenController();
  const proposalController = new ProposalController();
  router.use("/api", apiRouter);

  apiRouter.use("/health", (_req, res) => {
    res.json({ message: "Service is up and running." });
  });

  apiRouter.use("/", explorerController.router);
  apiRouter.use("/blocks", blockController.router);
  apiRouter.use("/delegators", delegatorController.router);
  apiRouter.use("/validators", validatorController.router);
  apiRouter.use("/transactions", transactionsController.router);
  apiRouter.use("/contracts", contractController.router);
  apiRouter.use("/tokens", tokenController.router);
  apiRouter.use("/proposals", proposalController.router);
  return router;
}
