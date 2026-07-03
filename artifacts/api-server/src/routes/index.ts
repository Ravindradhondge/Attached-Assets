import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import entriesRouter from "./entries";
import billsRouter from "./bills";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(customersRouter);
router.use(entriesRouter);
router.use(billsRouter);
router.use(settingsRouter);

export default router;
