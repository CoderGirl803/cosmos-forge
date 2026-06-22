import { Router, type IRouter } from "express";
import healthRouter from "./health";
import universeEmailsRouter from "./universeEmails";

const router: IRouter = Router();

router.use(healthRouter);
router.use(universeEmailsRouter);

export default router;
