//@ts-nocheck
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as CustomStrategy } from "passport-custom";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as authService from "../services/auth_service";
import * as userService from "../services/user_service";
import User from "@/models/user_model";
import { connectDB } from "../lib/db";
import {
  startTransaction,
  commitTransaction,
  abortTransaction,
} from "../lib/db_transaction";

// Initialize Passport
export const initializePassport = () => {
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const result = await authService.loginUser({ email, password });

          if (!result.success) {
            return done(null, false, { message: result.error });
          }

          const accessToken = generateToken(result.user);

          return done(null, { user: result.user, accessToken });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.use(
    "local-register",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        const { name, country_code } = req.body;
        let session;
        try {
          await connectDB();
          session = await startTransaction();

          // Check if business with email already exists
          const existingBusiness = await User.findOne({ email });
          if (existingBusiness) {
            await abortTransaction(session);
            return done(null, false, { message: "Email already in use" });
          }

          const newUser = await authService.registerUser(
            { name, email, password, country_code },
            session
          );

          const accessToken = generateToken(newUser);

          await commitTransaction(session);

          return done(null, { newUser, accessToken });
        } catch (error) {
          if (session) await abortTransaction(session);
          return done(error, false);
        }
      }
    )
  );

  passport.use(
    "magic-link",
    new CustomStrategy(async (req, done) => {
      await connectDB();
      const session = await startTransaction();
      try {
        const { email } = req.body;

        // 1. Verify the token (you'll create this logic)
        const user = await authService.OtpLogin(email, session);

        if (!user) {
          return done(null, false, { message: "Invalid or expired token" });
        }

        const accessToken = generateToken(user);
        await commitTransaction(session);
        return done(null, { user, accessToken });
      } catch (error) {
        abortTransaction(session);
        return done(error);
      }
    })
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "emails", "name", "picture.type(large)"],
      },
      async (accessToken, refreshToken, profile, done) => {
        await connectDB();
        const session = await startTransaction();
        console.log("Initialize Facebook Strategy");
        console.log(profile);
        try {
          let user = await userService.getUserByEmail(profile.emails[0].value);
          if (!user) {
            user = await userService.storeUser(
              {
                name: `${profile.name.givenName} ${profile.name.familyName}`,
                email: profile.emails[0].value,
                image: profile.photos[0].value,
                auth_provider: "facebook",
                password: null,
              },
              session
            );
          }
          const token = generateToken(user);
          await commitTransaction(session);
          return done(null, { ...user, accessToken: token });
        } catch (error) {
          await abortTransaction(session);
          return done(error, false);
        }
      }
    )
  );

  // // Google login
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log("Initialize Google Strategy");
        await connectDB();
        const session = await startTransaction();

        try {
          let user = await userService.getUserByEmail(profile.emails[0].value);

          if (!user) {
            user = await userService.storeUser(
              {
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value,
                auth_provider: "google",
                password: null,
              },
              session
            );
          }
          const token = generateToken(user);
          await commitTransaction(session);
          return done(null, { user, accessToken: token });
        } catch (error) {
          await abortTransaction(session);
          return done(error, false);
        }
      }
    )
  );
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_ACCESS_TOKEN || "your-secret-key",
    {
      expiresIn: "365d",
    }
  );
};

export const verifyToken = async (req, res, next) => {
  // Extract token from Authorization header (Bearer token) or cookies
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.auth_token;

  let token = null;

  // Check for Bearer token in Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // If no Bearer token, try to get from cookies (web app)
  else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_ACCESS_TOKEN || "your-secret-key"
    );

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "This session has expired. Please login" });
  }
};
