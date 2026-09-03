import { Router } from "express";

export default function registerRoutes(): Router {
  const router = Router();

  router.use("/status", (req, res) => {
    res.json({ message: "success" });
  });

  return router;
}
