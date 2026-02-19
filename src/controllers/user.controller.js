import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import mongoose , { mongo } from "mongoose";
import path from "path";

const registerUser = asyncHandler( async (req , res) => {

  const { email,username , password , role } = req.body
  console.log("email: " , email);
  console.log("FILE:", req.file);

  if (

    [email,username,password,role].some((field) => field?.trim() === "" )

  ) {
        throw new ApiError(400 , "All fields are required")
  }

  const existedUser = await User.findOne({ email })


  if (existedUser) {
    throw new ApiError(409 , "User with email already exists")
  }

 const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400 , "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(path.resolve(avatarLocalPath))

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    avatar: avatar.secure_url,
    email,
    password,
    role,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password"
  )

  if(!createdUser) {
    throw new ApiError(500 , "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  )

})

const generateAccessToken = async(userId) => {
  try {
    
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()

    return {accessToken}

  } catch (error) {
    
    throw new ApiError(500 , "Something went wrong while generating access token")

  }
}

const loginUser = asyncHandler(async function (req , res) {
  
  const {email,password} = req.body

  if (!email) {
    throw new ApiError(400,"Email is required")
  }

  const user = await User.findOne({ email })

  if(!user) {
    throw new ApiError(404, "User not found")
  }
  
  const  isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {
    throw new ApiError(401 , "Invalid user credentials")
  }


  const {accessToken} = await generateAccessToken(user._id)

  const loggedInUser = await User.findById(user._id).select(

    "-password"
  )

  const options = {
    httpOnly: true,
    secure: false
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken
      }, 
      "User logged in Successfully"
    )
  )

})

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false, // true in production
    })
    .json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
});

// backend/src/controllers/user.controller.js

const getCurrentUser = asyncHandler(async (req, res) => {
    // req.user is already populated by your verifyJWT middleware
    if (!req.user) {
        throw new ApiError(401, "User session not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            req.user, 
            "User session is active and fetched successfully"
        )
    );
});


export {
  registerUser,
  loginUser,
  generateAccessToken,
  logoutUser,
  getCurrentUser
}