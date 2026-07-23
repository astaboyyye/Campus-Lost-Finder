import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import itemsRouter from "./items";
import claimsRouter from "./claims";
import uploadUrlRouter from "./uploadUrl";
import assistantRouter from "./assistant";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/items", itemsRouter);
router.use("/claims", claimsRouter);
router.use(uploadUrlRouter);
router.use(assistantRouter);

export default router;
