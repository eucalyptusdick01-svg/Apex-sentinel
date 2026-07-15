import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sentinelRouter from "./sentinel";
import authRouter from "./auth";
import adminRouter from "./admin";
import suggestionsRouter from "./suggestions";
import stripeRouter from "./stripe";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(stripeRouter);
router.use("/sentinel/modules", requireAuth);
router.use("/sentinel/execute", requireAuth);
router.use("/sentinel/stream", requireAuth);
router.use(sentinelRouter);
router.use(suggestionsRouter);

export default router;
