import jwt from "jsonwebtoken";

export const validateJWT = (req, res, next) => {
  // for token i am using postmans Bearer token
  let token = req.header("Authorization");
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export default validateJWT;
