import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/db";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SESSION_COOKIE = "signal_session";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
    anonymousId?: string;
}

export const generateMagicLinkToken = (email: string) => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
};

export const verifyMagicLinkToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        return decoded.email;
    } catch (e) {
        return null;
    }
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Check for Session Cookie
    const token = req.cookies[SESSION_COOKIE];

    if (token) {
        // Verify against DB
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });

        if (session && session.expiresAt > new Date()) {
            req.user = session.user;
        }
    }

    // Capture anonymous ID if present (from header or cookie)
    req.anonymousId = req.headers["x-anonymous-id"] as string || req.cookies["anon_id"];

    next();
};

export async function createSession(userId: string, res: Response) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt
        }
    });

    // Set Cookie
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: process.env.COOKIE_DOMAIN || (isProd ? ".signalengines.com" : undefined),
        expires: expiresAt
    });
}
