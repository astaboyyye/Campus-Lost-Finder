import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import usersRouter from "./users.js";
import itemsRouter from "./items.js";
import claimsRouter from "./claims.js";
import uploadUrlRouter from "./uploadUrl.js";
import assistantRouter from "./assistant.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/items", itemsRouter);
router.use("/claims", claimsRouter);
router.use(uploadUrlRouter);
router.use(assistantRouter);

export default router;
