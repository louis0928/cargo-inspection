/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import login_img from "../assets/logo_no_text.png";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleGoogle = (credentialResponse) => {
    axios
      .post(
        "https://integration.eastlandfood.com/eastland-users/auth/login",
        { token: credentialResponse.credential },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        const accessToken = res.data.tokens.accessToken;
        const credentialResult = jwtDecode(accessToken);
        const roles = [credentialResult.capabilities["CARGO"]];

        setAuth({ accessToken: accessToken, roles: roles });
        setTimeout(() => {
          alert("Session timed out! Please log back in!");
          navigate("/dashboard");
        }, 1000 * 60 * 60 * 24); // 1 day
        navigate(from, { replace: true });
      })
      .catch((err) => {
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 400) {
          setErrMsg("Missing Username or password");
        } else if (err.response?.status === 401) {
          setErrMsg("Unauthorized");
        } else {
          setErrMsg("Login Failed");
        }
        console.log(err.response);
      })
      .finally(() => {
        setIsLoggedIn(false);
      });

    if (credentialResponse) {
      setIsLoggedIn(true);
    }
  };

  const handleError = (e) => {
    console.log("Login Failed");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <img
              src={login_img}
              alt="3PL Request Platform Logo"
              className="w-[120px] h-[40px] object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Cargo Inspection Platform
          </h1>
        </CardHeader>
        <CardContent>
        <div className="flex justify-center mb-4">
          <GoogleLogin onSuccess={handleGoogle} onError={handleError} />
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
