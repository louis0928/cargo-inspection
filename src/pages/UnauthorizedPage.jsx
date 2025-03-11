/* eslint-disable react/no-unescaped-entities */
"use client";

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/login");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10 text-center">
            <div className="mb-6 flex justify-center">
              <motion.svg
                width="200"
                height="140"
                viewBox="0 0 200 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Lock body */}
                <motion.rect
                  x="70"
                  y="50"
                  width="60"
                  height="70"
                  rx="8"
                  fill="#f87171"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />

                {/* Lock shackle */}
                <motion.path
                  d="M75 50V40C75 24 125 24 125 40V50"
                  stroke="#ef4444"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />

                {/* Keyhole */}
                <motion.circle
                  cx="100"
                  cy="80"
                  r="8"
                  fill="white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                />
                <motion.rect
                  x="97"
                  y="88"
                  width="6"
                  height="12"
                  fill="white"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                />

                {/* Warning sign */}
                <motion.path
                  d="M40 110L20 80L60 80L40 110Z"
                  fill="#fbbf24"
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                />
                <motion.text
                  x="40"
                  y="100"
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                >
                  !
                </motion.text>

                {/* Stop sign */}
                <motion.circle
                  cx="160"
                  cy="90"
                  r="20"
                  fill="#ef4444"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                />
                <motion.text
                  x="160"
                  y="97"
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                >
                  ✕
                </motion.text>
              </motion.svg>
            </div>

            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Access Denied
            </motion.h1>

            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              You don't have permission to access this page
            </motion.p>

            <motion.p
              className="text-sm text-gray-500 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              If you believe this is an error, please contact your administrator
              or try logging in with different credentials.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                onClick={goBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={goHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Login
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="bg-gray-50 px-6 py-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-xs text-center text-gray-500">
              Error Code: 403 Forbidden | Access Restricted
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
