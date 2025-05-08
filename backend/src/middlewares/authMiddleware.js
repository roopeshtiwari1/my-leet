import jwt from "jsonwebtoken";
import {db} from "../libs/db.js"

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      return res.status(401).json({
        message: "unauthorized user - token missing"
      })
    }

    let decoded ;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(401).json({
        message: "unauthorized user - token invalid"
      })
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true
      }
    })

    if(!user) {
      return res.status(404).json({
        message: "user not found"
      })
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Error authenticating user-", error);
    res.status(500).json({
      message: "error authenticating user"
    })
    
  }
}