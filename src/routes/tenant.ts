import express, { Request, Response } from "express";

const tenantRouter = express.Router();

tenantRouter.post("/", (req: Request, res: Response) => {
  res.status(201).send();
});

export default tenantRouter;
