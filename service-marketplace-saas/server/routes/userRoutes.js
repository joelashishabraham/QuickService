const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

/* ================= UPDATE PROFILE ================= */

router.put("/update", authMiddleware, async (req, res) => {
  try {

    const { name, email, phone, address, avatar } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    /* UPDATE FIELDS */
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({
      success:true,
      message:"Profile updated",
      data:user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
});

module.exports = router;