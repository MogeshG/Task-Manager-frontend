import { jwtDecode } from "jwt-decode";
export const isTokenValid = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);

    if (!decoded?.exp) return true;

    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return true;
  }
};
