
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    "primenest_super_secret_jwt_key_minimum_32_characters_long_12345";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    if (
      !payload.userId ||
      !payload.email ||
      !["user", "admin"].includes(payload.role)
    ) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch (error) {
  console.error(
    "Session verification failed:",
    error.code || error.message
  );
  return null;
}
}
