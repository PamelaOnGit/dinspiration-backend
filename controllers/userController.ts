require('dotenv').config()

import Users from "../models/users"
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { checkPasswords, validatePassword } from "../models/users"
// import formatValidationError from "../errors/validation"


import jwt from 'jsonwebtoken'
import { secret } from "../config/environment"


export async function signupUser(req: Request, res: Response) { 
  try {
    if (checkPasswords(req.body.password, req.body.passwordConfirmation)) { 
    const newUser = await Users.create(req.body)  
    return res.status(StatusCodes.OK).send(newUser)    
    } else { 
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({message: "Password confirmation did not match the password"})
    }
  }catch(e: any) { 
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(e.message)
    console.log(e.message)
  }
}

export async function loginUser(req: Request, res: Response) { 
  try { 
    const user = await Users.findOne({ email: req.body.email })
    if (!user) { 
      return res.status(StatusCodes.NOT_FOUND).send({ message: "Account not found"})
    } else { 
// jwt auth begins
const isValidPw = validatePassword(req.body.password, user.password) 
if (isValidPw) { 
  const username = req.body.username
  const token = jwt.sign({userId: user._id }, secret, { expiresIn: '24h'})
  return res.status(StatusCodes.OK).send({messsage: "Login successful", token})
} else {
  res.status(StatusCodes.BAD_REQUEST).send({message: "Login failed"})
}
// jwt auth ends
    }
  } catch(e) { 
    return res.status(StatusCodes.BAD_REQUEST).send({message: "Login failed"})
  }
}