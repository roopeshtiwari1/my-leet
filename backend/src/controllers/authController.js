import bcrypt from"bcryptjs";
import {db} from "../libs/db.js"
import UserRole from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"


export const register = async (req,res) => {
  const {email, password, name} = req.body;

  try {
    const existingUser = await db.user.findUnique ({
      where: {
        email
      }
    })

    if (existingUser) {
      return res.status(400).json({
        error:"user already exits"
      })
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER
      }
    })

    const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, { expiresIn: "7d" })
    
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7*24*60*60*1000  
    })

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image
      }
    })


  } catch (error) {
    console.log("error creating user-", error);
    res.status(500).json({
      error: "error creating user"
    })
    
  }
}

export const login = async (req,res) => {
  const{email,password} = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      return res.status(401).json({
        error: "user not found"
      })
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if(!isMatched) {
      return res.status(401).json({
        error: "invalid credentials"
      })
    }

    const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, { expiresIn: "7d" })
    
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7*24*60*60*1000  
    })

    res.status(200).json({
      success: true,
      message: "user logged-in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image
      }
    })

  } catch (error) {
    console.log("error logging-in user-", error);
    res.status(500).json({
      error: "error logging-in user"
    })
  }
}

export const logout = async (req,res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    })

    res.status(200).json({
      success: true,
      message: "user logged out successfully"
    })

  } catch (error) {
    console.log("error logging-out user-", error);
    res.status(500).json({
      error: "error logging-out user"
    })
  }
}

export const profile = async (req,res) => {
  try {
    res.status(200).json({
      success: true,
      message: "user authentication successfully",
      user: req.user
    })
  } catch (error) {
    console.log("error getting user profile-", error);
    res.status(500).json({
      error: "error getting user profile"
    })
  }
}