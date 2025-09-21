import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast"; // ✅ correct import
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ get email from state (passed during signup)
  const email = location.state?.email || null;
  console.log("Verifying email for:", email);

  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (email) {
      toast.success(`📩 Verification email sent to ${email}`);
    }
  }, [email]);

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

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, {
        email,
        otp: enteredOtp,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Email verified successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.error || "Verification failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Server error.");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.RESEND_OTP, {
        email,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("📨 OTP resent successfully.");
        setOtp(Array(6).fill(""));
        setCountdown(60);
        inputsRef.current[0]?.focus();
        // ✅ update user in context here
        updateUser(response.data.user); // <--- add this line
      } else {
        toast.error(response.data.error || "Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Server error.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-[400px] shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-gray-500 mb-6">
            Enter the 6-digit code we sent to your email
          </p>

          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button className="w-full mb-4" onClick={handleSubmit}>
            Verify OTP
          </Button>

          <div className="text-sm text-gray-600 flex justify-center items-center">
            {countdown > 0 ? (
              <p>
                Resend OTP in{" "}
                <span className="font-semibold text-gray-800">
                  {countdown}s
                </span>
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
