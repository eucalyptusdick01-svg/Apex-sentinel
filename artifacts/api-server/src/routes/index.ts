import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sentinelRouter from "./sentinel";
import authRouter from "./auth";
import adminRouter from "./admin";
import suggestionsRouter from "./suggestions";
import stripeRouter from "./stripe";
import giftRouter from "./gift";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(stripeRouter);
router.use(giftRouter);
// execute and stream are open to guests — 4-run limit enforced inside sentinel.ts
router.use(sentinelRouter);
router.use(suggestionsRouter);

export default router;
