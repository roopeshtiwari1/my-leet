import express from "express"
import { login, logout, profile, register } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";



const authRoutes = express.Router();

authRoutes.post("/register", register )
authRoutes.post("/login", login)
authRoutes.get("/logout", authMiddleware, logout)
authRoutes.get("/profile", authMiddleware, profile)


export default authRoutes;