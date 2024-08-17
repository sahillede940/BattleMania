import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const Register = async (req, res) => {
  let { username, email, password } = req.body;

  email = email.toLowerCase();
  username = username.toLowerCase();
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Login = async (req, res) => {
  let { email, password } = req.body;

  email = email.toLowerCase();
  
  try {
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };

    user.password = undefined;

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3 * 60 * 60 },
      (error, token) => {
        if (error) throw error;
        res.status(200).json({
          token: token,
          user: user,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { Register, Login };
