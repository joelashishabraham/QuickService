const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



/* ================= HELPER ================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const sendUser = (user) => {
  return {
    _id: user._id,                // 🔥 VERY IMPORTANT
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    city: user.city || "",
    avatar: user.avatar || ""
  };
};

/* ================= REGISTER ================= */

exports.register = async (req, res) => {
  try {
console.log("BODY:", req.body); // 👈 ADD THIS
    const { name, email, password, role, phone, city } = req.body;

    /* VALIDATION */
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing"
      });
    }

    /* CHECK EXISTING */
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    /* HASH PASSWORD */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* CREATE USER */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      phone,
      city
    });

    /* TOKEN */
    const token = generateToken(user);

    /* RESPONSE */
    res.status(201).json({
      success: true,
      token,
      user: sendUser(user)
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    /* VALIDATION */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    /* FIND USER */
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    /* CHECK PASSWORD */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    /* TOKEN */
    const token = generateToken(user);

    /* RESPONSE */
    res.json({
      success: true,
      token,
      user: sendUser(user)   // 🔥 ALWAYS RETURN _id
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= GET PROFILE ================= */

exports.getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: sendUser(user)
    });

  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};