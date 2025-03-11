import useAuth from "./useAuth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const refresh = async () => {
    const response = await axios.get(
      `https://integration.eastlandfood.com/eastland-users/auth/getNewToken`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // allow to send cookies to the backend
      }
    );
    const decodedResult = jwtDecode(response.data.accessToken);
    setAuth((prev) => {
      return {
        ...prev,
        roles: [decodedResult.capabilities["CARGO"]],
        accessToken: response.data.accessToken,
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
