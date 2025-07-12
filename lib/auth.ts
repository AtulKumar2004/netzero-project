import { jwtVerify } from 'jose';
import { SignJWT } from 'jose';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface AuthUser {
  userId: string;
  role: 'ngo' | 'donor' | 'admin'; // or whatever roles you use
}


export async function verifyToken(token?: string): Promise<AuthUser | null> {
  try {
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);

    // Assert payload is of type AuthUser
    const user = payload as unknown as AuthUser;

    // Optionally: validate fields at runtime (extra safe)
    if (typeof user.userId !== 'string' || typeof user.role !== 'string') {
      throw new Error('Invalid token payload shape');
    }

    return user;
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function generateResetToken(): Promise<string> {
  return await new SignJWT({ type: 'reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
}

export async function generateVerificationToken(): Promise<string> {
  return await new SignJWT({ type: 'verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}