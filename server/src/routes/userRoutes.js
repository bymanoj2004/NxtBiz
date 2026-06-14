import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { permissions } from "../config/specRules.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";

export const userRouter = express.Router();

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["Admin", "Manager", "Employee", "Viewer"]),
  active: z.boolean().optional()
});

userRouter.use(requireAuth);

userRouter.get("/", requireRole(permissions.listUsers), async (req, res) => {
  const users = await User.find().select("-passwordHash -refreshTokenHash").sort({ createdAt: -1 });
  res.json(users);
});

userRouter.post("/", requireRole(permissions.createUsers), validate(userSchema), async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password || "NxtBiz12345", 12);
  const user = await User.create({ ...req.body, passwordHash });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active });
});

userRouter.put("/:id", requireRole(permissions.updateUsers), validate(userSchema.partial()), async (req, res) => {
  const update = { ...req.body };
  if (update.password) {
    update.passwordHash = await bcrypt.hash(update.password, 12);
    delete update.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash -refreshTokenHash");
  res.json(user);
});

userRouter.delete("/:id", requireRole(permissions.deleteUsers), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
