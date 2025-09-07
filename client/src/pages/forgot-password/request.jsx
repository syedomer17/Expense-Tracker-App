import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ instead of useRouter
import toast from "react-hot-toast"; // ✅ instead of sonner
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

export default function RequestOtpPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.FORGOTPASSWORD.REQUEST_OTP,{
        email
      })

      if (response.status === 200 || response.status === 201) {
        toast.success("✅ OTP sent to your email.");
        // ✅ Navigate to verify page with email query
        navigate(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.data?.error || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 py-10 space-y-8 border">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-gray-500 text-sm">
              Enter your email and we’ll send you a one-time password to reset it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600">
            Remember your password?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
