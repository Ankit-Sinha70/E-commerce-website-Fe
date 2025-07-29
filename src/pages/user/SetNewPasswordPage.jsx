import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordConfirm } from "../../features/auth/authSlice";

const SetNewPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const resultAction = await dispatch(
      resetPasswordConfirm({ token, password: newPassword })
    );

    if (resetPasswordConfirm.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload);
      navigate("/login");
    } else {
      toast.error("Failed to reset password", {
        description: error || "An unexpected error occurred.",
      });
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Password reset token is missing.");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Panel */}
          <div className="lg:w-1/2 bg-gradient-to-br from-black to-pink-500 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black to-pink-600 bg-opacity-10 z-0" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white bg-opacity-10 rounded-full z-0" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full z-0" />

            <div className="z-10 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Set Password</h1>
              <p className="text-lg lg:text-xl opacity-90">
                Choose a secure password to access your account.
              </p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-[1.01]">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  Set New Password
                </h2>
                <p className="text-gray-600">
                  Please enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetNewPasswordPage;
