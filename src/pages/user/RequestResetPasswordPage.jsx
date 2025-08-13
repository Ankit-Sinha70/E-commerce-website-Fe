import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordRequest } from "../../features/auth/authSlice";

const RequestResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(forgotPasswordRequest(email));
    if (forgotPasswordRequest.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload, { className: "toast-success" });
      setEmail("");
    } else {
      toast.error(error || "An unexpected error occurred.", { className: "toast-danger" });
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Password reset error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Panel - Illustration or Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-black to-pink-500 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute inset-0 bg-gradient-to-br from-black to-pink-600  bg-opacity-10 z-0" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white bg-opacity-10 rounded-full z-0" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full z-0" />

            <div className="z-10 text-center">
              <h1 className="text-3xl lg:text-5xl font-bold mb-6">Reset Password</h1>
              <p className="text-lg lg:text-xl opacity-90">
                Enter your email address to receive a password reset link.
              </p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-[1.01]">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">
                  Forgot Your Password?
                </h2>
                <p className="text-gray-600">
                  We'll email you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  &larr; Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestResetPasswordPage;
