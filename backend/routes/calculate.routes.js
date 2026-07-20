import { Router } from "express";
import { calculate } from "../controllers/calculate.controller.js";

const router = Router();

router.post("/", calculate);

export default router;
