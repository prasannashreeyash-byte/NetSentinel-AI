import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function authenticate(req,res,next) {
  try {
    const header=req.headers.authorization||'';
    const token=header.startsWith('Bearer ')?header.slice(7):null;
    if(!token) return res.status(401).json({error:'Sign in to continue.'});
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(payload.sub);
    if(!user||!user.active) return res.status(401).json({error:'Account is unavailable.'});
    req.user=user; next();
  } catch { return res.status(401).json({error:'Session expired. Please sign in again.'}); }
}
export function requireAdmin(req,res,next) {
  if(req.user?.role!=='admin') return res.status(403).json({error:'Administrator access required.'});
  next();
}
