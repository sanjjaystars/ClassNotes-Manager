import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import subjectsRouter from "./subjects";
import notesRouter from "./notes";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(subjectsRouter);
router.use(notesRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
