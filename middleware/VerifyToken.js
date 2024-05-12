import jwt from "jsonwebtoken";
import { errorRes } from "../utils/response.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return errorRes(null, "Access Token Invalid", res, 403);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return errorRes(null, "Access Token Invalid", res, 403);
    req.email = decoded.email;
    next();
  });
};
