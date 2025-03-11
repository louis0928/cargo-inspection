/* eslint-disable no-unused-vars */
import useAuth from "./useAuth";
import axios from "axios";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});
    try {
      const response = await axios.delete(
        "https://integration.eastlandfood.com/eastland-users/auth/logout",
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return logout;
};

export default useLogout;
