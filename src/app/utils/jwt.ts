import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const generateToken = (payload: object, secret: string, expiresIn: string): string => {
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
    return jwt.verify(token, secret) as JwtPayload;
};
