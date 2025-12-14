
import jwt from 'jsonwebtoken';

export const verifyToken = (token: string, secret: string) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
