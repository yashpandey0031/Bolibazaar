import User from "../models/user.model.js";
import Login from "../models/login.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { getClientIp, getLocationFromIp } from "../utils/geoDetails.js";
import { clearCookie, setCookie } from "../utils/cookies.util.js";

const mapAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  credits: user.credits,
});

export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All Fields are required" });
  try {
    const user = await User.findOne({ email });
    //  Checking user exists — use same message to prevent user enumeration
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Password Validate
    const psswordValidate = await bcrypt.compare(password, user.password);
    if (!psswordValidate) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ error: "Your account has been suspended. Contact admin." });
    }

    // generating jwt token
    const token = generateToken(user._id, user.role);

    // Set HTTP-only cookie
    setCookie(res, token);

    // Getting user geo location
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];
    const safeUser = mapAuthUser(user);

    // Respond first to keep login snappy; tracking runs in the background.
    res
      .status(200)
      .json({ message: "Login Successful", token, user: safeUser });

    void (async () => {
      try {
        const location = await getLocationFromIp(ip);

        await Promise.allSettled([
          User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            location,
            ipAddress: ip,
            userAgent,
          }),
          Login.create({
            userId: user._id,
            ipAddress: ip,
            userAgent,
            location,
            loginAt: new Date(),
          }),
        ]);
      } catch (trackingError) {
        console.error("Login tracking error:", trackingError.message);
      }
    })();

    return;
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error from handle login" });
  }
};

export const handleUserSignup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Checking input fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Server-side password strength validation
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  try {
    const existingUser = await User.findOne({ email });

    // Checking existing of user
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // Getting geo details
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];
    const [location, hashedPassword] = await Promise.all([
      getLocationFromIp(ip),
      bcrypt.hash(password, 10),
    ]);

    // Saving user to database
    const STARTER_CREDITS = 100;
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      credits: STARTER_CREDITS,
      role: role === "admin" ? "admin" : "user",
      ipAddress: ip,
      userAgent,
      location,
      signupAt: new Date(),
      lastLogin: new Date(),
    });
    await newUser.save();

    // Log starter credits to ledger
    await CreditLedger.create({
      userId: newUser._id,
      type: "assigned",
      amount: STARTER_CREDITS,
      reason: "Welcome bonus — starter credits on signup",
    });

    // Generating jwt token
    const token = generateToken(newUser._id, newUser.role);

    // Set HTTP-only cookie
    setCookie(res, token);

    const safeUser = mapAuthUser(newUser);

    res
      .status(201)
      .json({ message: "User registered successfully", token, user: safeUser });

    void Login.create({
      userId: newUser._id,
      ipAddress: ip,
      userAgent,
      location,
      loginAt: new Date(),
    }).catch((trackingError) => {
      console.error("Signup login-tracking error:", trackingError.message);
    });

    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const handleUserLogout = async (req, res) => {
  clearCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
};
