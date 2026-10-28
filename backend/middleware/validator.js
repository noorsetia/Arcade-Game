import { ZodError } from "zod";
function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Input validation failed",
          code: "VALIDATION_ERROR",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      next(err);
    }
  };
}
function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Query validation failed",
          code: "VALIDATION_ERROR",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      next(err);
    }
  };
}
export {
  validateBody,
  validateQuery
};
