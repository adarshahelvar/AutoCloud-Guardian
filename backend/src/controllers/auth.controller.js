import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await registerUser(name, email, password);

    return res.status(201).json({
      success: true,
      message: "User registered successfully...!",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "User regsitration failed",
      errorMessage: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const data = await loginUser(email, password);

    return res
      .status(200)
      .json({ success: true, message: "Login successfull", ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Login failed",
      errorMessage: error.message,
    });
  }
};
