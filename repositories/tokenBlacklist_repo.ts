import TokenBlacklist from "@/models/tokenBlacklist_model";

export async function addTokenToBlacklist(
  tokenData: {
    token: string;
    user_id: string;
    expires_at: Date;
  },
  options: { session?: any } = {}
) {
  try {
    const blacklistedToken = new TokenBlacklist(tokenData);
    return await blacklistedToken.save(options);
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
    throw error;
  }
}

export async function isTokenBlacklisted(token: string) {
  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return !!blacklistedToken;
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    throw error;
  }
}

export async function removeExpiredTokens() {
  try {
    const now = new Date();
    return await TokenBlacklist.deleteMany({
      expires_at: { $lt: now },
    });
  } catch (error) {
    console.error("Error removing expired tokens:", error);
    throw error;
  }
}