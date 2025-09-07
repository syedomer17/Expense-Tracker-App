import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract email from query params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error("Invalid request. Please try again.");
      navigate("/forgot-password/request");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("Text").slice(0, 6).split("");
    setOtp(pasteData);
    pasteData.forEach((val, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = val;
    });
    inputsRef.current[Math.min(pasteData.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.FORGOTPASSWORD.VERIFY_OTP,{
        email,
        otp: enteredOtp,
      })

      if (response.status === 200) {
        toast.success("✅ OTP verified! You can now reset your password.");
        navigate(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.data?.error || "Verification failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);

    try {
      const response = await axiosInstance.post(API_PATHS.FORGOTPASSWORD.REQUEST_OTP,{
        email
      })

      if (response.status === 200) {
        toast.success("OTP resent successfully.");
        setOtp(Array(6).fill(""));
        setCountdown(60);
        inputsRef.current[0]?.focus();
      } else {
        toast.error(response.data?.error || "Failed to resend OTP.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to resend OTP.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          {/* OTP Inputs */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          {/* Resend */}
          <div className="text-sm text-gray-600">
            {countdown > 0 ? (
              <p>
                Resend OTP in{" "}
                <span className="font-semibold text-gray-800">{countdown}s</span>
              </p>
            ) : (
              <Button
                variant="link"
                className="p-0 text-blue-600 hover:underline"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Resending..." : "Resend OTP"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
