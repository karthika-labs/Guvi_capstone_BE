const Users = require('../models/users.js');
const sendEmail = require("../utils/sendEmails.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


//Register
const register = async (req, res) => {
    try {

        const existingUser = await Users.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);


        const newUser = await Users.create({
            ...req.body,
            password: hashedPassword,
        });


        res.json({
            success: true,
            message: "User registered successfully",

        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};


//Login
const login = async (req, res) => {
    try {
        const existingUser = await Users.findOne({ email: req.body.email })
        if (!existingUser) {
            return res.status(400).json({ message: "User doesn't have an account" })
        }
        const isMatch = await bcrypt.compare(req.body.password, existingUser.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" })
        }
        const token = jwt.sign({ _id: existingUser._id }, process.env.jwt_secretkey, { expiresIn: "1d" })
        res.json({ message: "login successfull", token })
    }
    catch (e) {
        res.status(500).json({ message: e.message })
    }
}

//Forget_password
const forget_password = async (req, res) => {
    try {

        const user = await Users.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const passwordToken = jwt.sign({ _id: user._id }, process.env.jwt_secretkey, { expiresIn: "15m" })

        const resetLink = `https://recipes.com/reset-password/${passwordToken}`

        const html = `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>`

        await sendEmail(user.email, "Reset Password Link", html)

        user.passwordToken = passwordToken
        user.expiry = Date.now() + 15 * 60 * 1000
        await user.save()

        res.json({ message: "email sent successfull" ,passwordToken:passwordToken})

    }
    catch (e) {
        res.json({ message: e.message })
    }


}

//reset_password 
const reset_password = async (req, res) => {
    try {
        const decode = jwt.verify(req.params.token, process.env.jwt_secretkey)
        const user = await Users.findOne({ _id: decode._id, passwordToken: req.params.token, expiry: { $gt: Date.now() } })
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        user.password = hashedPassword
        user.passwordToken = null;
        user.expiry = null
        await user.save()
        res.json({ message: "Password reset successfully" })
    }
    catch (e) {
        res.json({ message: e.message })
    }
}

const getUser = async (req, res) => {
    try {
        const allUser = await Users.find()
        if (!allUser.length) {
            return res.json({ message: "no users found" })
        }
        res.json({ allUser })
    }
    catch (e) {
        res.json({ message: "some thing went wrong while getting all users", error: e.message })
    }
}

const currentUser = async (req, res) => {
    try {
        const user = await Users.findById(req.user._id).select('-password').populate("recipes");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }       
}




const updateProfile = async (req, res) => {
  try {
    const updated = await Users.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


module.exports = {
    register,
    login,
    forget_password,
    reset_password, getUser,currentUser,updateProfile
}