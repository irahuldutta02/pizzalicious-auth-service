import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
import { TenantController } from "../controllers/TenantController";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";

const tenantRouter = express.Router();

// repositories
const tenantRepository = AppDataSource.getRepository(Tenant);

// services instances
const tenantService = new TenantService(tenantRepository);

// controller instance
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post("/", (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await tenantController.create(req, res, next);
}) as RequestHandler);

export default tenantRouter;
