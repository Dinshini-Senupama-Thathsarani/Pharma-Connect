import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['mr', 'pharmacy']), // admins are created by the seed script only
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const issueTokens = async (user: InstanceType<typeof User>) => {
  const payload = { id: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

const publicUser = (u: InstanceType<typeof User>) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

export const register = async (req: Request, res: Response) => {
  if (await User.findOne({ email: req.body.email })) throw new HttpError(409, 'Email already registered');
  const user = await User.create(req.body);
  const tokens = await issueTokens(user);
  res.status(201).json({ success: true, message: 'Registered', data: { user: publicUser(user), ...tokens } });
};

export const login = async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email }).select('+password +refreshToken');
  if (!user || !user.isActive || !(await user.comparePassword(req.body.password)))
    throw new HttpError(401, 'Invalid email or password');
  const tokens = await issueTokens(user);
  res.json({ success: true, message: 'Logged in', data: { user: publicUser(user), ...tokens } });
};

// Refresh token rotation: every refresh returns a NEW pair and invalidates the old one
export const refresh = async (req: Request, res: Response) => {
  let payload;
  try {
    payload = verifyRefreshToken(req.body.refreshToken);
  } catch {
    throw new HttpError(401, 'Refresh token invalid or expired');
  }
  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || !user.isActive || user.refreshToken !== hashToken(req.body.refreshToken))
    throw new HttpError(401, 'Refresh token revoked');
  const tokens = await issueTokens(user);
  res.json({ success: true, message: 'Token refreshed', data: { user: publicUser(user), ...tokens } });
};

export const logout = async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!.id, { $unset: { refreshToken: 1 } });
  res.json({ success: true, message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ success: true, data: publicUser(user) });
};

export const listUsers = async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.role) filter.role = String(req.query.role);
  const users = await User.find(filter).select('name email role isActive').sort('name');
  res.json({ success: true, data: users });
};
