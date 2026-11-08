import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const ms = (timeStr: string): number => {
    const match = timeStr.match(/^([0-9]+)([msdh])$/);
    if (!match) {
        return 24 * 60 * 60 * 1000;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 's': return value * 1000;
        default: return value;
    }
};

/**
 * In production: resolves domain with leading dot (e.g. .avirosoft.com) from process.env.WEBDOMAIN
 * In development / localhost: returns undefined so cookie binds to localhost regardless of port
 */
export const getCookieDomain = (): string | undefined => {
    if (env.NODE_ENV !== "production" || !env.WEBDOMAIN) {
        return undefined;
    }
    const cleanDomain = env.WEBDOMAIN.trim().replace(/^\./, "");
    return `.${cleanDomain}`;
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    const isProd = env.NODE_ENV === "production";
    const targetDomain = getCookieDomain();

    const baseOptions: CookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        domain: targetDomain,
    };

    // 1. Set Access Token Cookie (httpOnly)
    res.cookie("accessToken", accessToken, {
        ...baseOptions,
        maxAge: ms(env.ACCESS_TOKEN_EXPIRES_IN),
    });

    // 2. Set Refresh Token Cookie (httpOnly)
    res.cookie("refreshToken", refreshToken, {
        ...baseOptions,
        maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN),
    });
};

export const clearAuthCookies = (res: Response) => {
    const isProd = env.NODE_ENV === "production";
    const targetDomain = getCookieDomain();

    const baseOptions: CookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        domain: targetDomain,
    };

    res.clearCookie("accessToken", baseOptions);
    res.clearCookie("refreshToken", baseOptions);
};
