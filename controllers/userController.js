const Users = require('../models/users.js');
const sendEmail = require("../utils/sendEmails.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cloudinary = require('../config/cloudinary'); // Import Cloudinary



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

        // Use environment variable for frontend URL, fallback to localhost for development
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
        const resetLink = `${frontendUrl}/reset-password/${passwordToken}`

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
        const user = await Users.findById(req.user._id)
          .select('-password')
          .populate("recipes")
          .populate({
            path: 'followers',
            select: 'username avatar name'
          })
          .populate({
            path: 'followings',
            select: 'username avatar name'
          });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }       
}




// Helper to extract Cloudinary public ID from a URL
const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a new avatarUrl is provided in the request body
    if (req.body.avatar) {
      // If user already has an avatar, delete the old one from Cloudinary
      if (user.avatar) {
        const oldAvatarPublicId = getCloudinaryPublicId(user.avatar);
        if (oldAvatarPublicId) {
          await cloudinary.uploader.destroy(oldAvatarPublicId);
          console.log(`Deleted old avatar: ${oldAvatarPublicId}`);
        }
      }
      user.avatar = req.body.avatar; // Update with the new avatar URL
    }

    // Update other profile fields
    // Use !== undefined to allow empty strings to be saved
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.dietaryPreference !== undefined) user.dietaryPreference = req.body.dietaryPreference;
    if (req.body.favouriteCuisines !== undefined) {
      user.favouriteCuisines = req.body.favouriteCuisines 
        ? req.body.favouriteCuisines.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];
    }

    await user.save();

    const updatedUser = await Users.findById(userId).select("-password").populate("recipes"); // Re-fetch to populate
    res.json(updatedUser);
  } catch (e) {
    console.error("Error updating profile:", e);
    res.status(500).json({ message: e.message });
  }
};

// Get user by ID (for viewing other users' profiles)
const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId)
      .select('-password')
      .populate("recipes")
      .populate({
        path: 'followers',
        select: 'username avatar name'
      })
      .populate({
        path: 'followings',
        select: 'username avatar name'
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    // Can't follow yourself
    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await Users.findById(currentUserId);
    const targetUser = await Users.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.followings.includes(targetUserId)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Add to current user's followings
    currentUser.followings.push(targetUserId);
    await currentUser.save();

    // Add to target user's followers
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    res.json({ message: "User followed successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const currentUser = await Users.findById(currentUserId);
    const targetUser = await Users.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if not following
    if (!currentUser.followings.includes(targetUserId)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove from current user's followings
    currentUser.followings = currentUser.followings.filter(
      id => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove from target user's followers
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId
    );
    await targetUser.save();

    res.json({ message: "User unfollowed successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get followers list
const getFollowers = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'username avatar name'
      })
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ followers: user.followers });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get following list
const getFollowing = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId)
      .populate({
        path: 'followings',
        select: 'username avatar name'
      })
      .select('followings');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ following: user.followings });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


module.exports = {
    register,
    login,
    forget_password,
    reset_password, 
    getUser,
    currentUser,
    updateProfile,
    getUserById,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
}