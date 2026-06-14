import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = bearer || req.cookies.accessToken;

    if (!token) return res.status(401).json({ message: "Authentication required" });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");
    if (!user || !user.active) return res.status(401).json({ message: "Invalid session" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
