import { useEffect, useState } from "react";
import {
  apiUrl,
  createAuthHeaders,
  parseApiResponse,
} from "../config/api";

function useAuthenticatedUser() {
  const storedUser = localStorage.getItem("authUser");
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(storedUser && token));

  useEffect(() => {
    const loadUser = async () => {
      if (!user?.id || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl(`/api/users/${user.id}`), {
          headers: createAuthHeaders("authToken"),
        });
        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load account.");
        }

        setUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(data.user));
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, user?.id]);

  return {
    user,
    token,
    message,
    loading,
    setUser,
  };
}

export default useAuthenticatedUser;
