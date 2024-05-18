import express from "express";
import Auth from "../../controllers/Auth/AuthController.js";

const router = express.Router();
const auth = new Auth();

router.post("/login", auth.login);
router.post("/register", auth.register);
router.post("/refreshToken", auth.refreshToken);
router.get("/logout", auth.logout);

export default router;
