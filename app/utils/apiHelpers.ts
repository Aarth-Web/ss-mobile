import { useAuth } from "../hooks/authContext";

// Function to handle API responses, checking for 401 errors
export const handleApiResponse = async (
  response: Response,
  logout?: () => void
) => {
  if (response.status === 401) {
    // Token expired or invalid
    console.log("Authentication error: Token expired or invalid");

    if (logout) {
      // Log the user out
      setTimeout(() => {
        logout();
      }, 300);

      throw new Error("Your session has expired. Please log in again.");
    }
  }

  // Check if the response is not ok for other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return await response.json();
};

// Function to create fetch options with authentication
export const createAuthFetchOptions = (
  token: string | null,
  options: RequestInit = {}
) => {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};
