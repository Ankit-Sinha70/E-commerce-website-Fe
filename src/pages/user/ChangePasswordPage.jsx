import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, clearChangePasswordState, logout } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { CheckCircle, Eye, EyeOff, Shield, X, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const {
    changePasswordStatus,
    changePasswordError,
    changePasswordSuccess,
  } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Visibility states for each password field
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (changePasswordStatus === "succeeded" && changePasswordSuccess) {
      toast.success(changePasswordSuccess);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      dispatch(clearChangePasswordState());
      setShowDialog(true);
    } else if (changePasswordStatus === "failed" && changePasswordError) {
      toast.error(changePasswordError);
      dispatch(clearChangePasswordState());
    }
  }, [changePasswordStatus, changePasswordSuccess, changePasswordError, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    dispatch(changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword, accessToken }));
  };

  // Sign out from all devices
  const handleSignOutAll = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setShowDialog(false);
    navigate("/login");
    toast.success("Signed out from all devices.");
  };

  // Keep signed in
  const handleKeepSignedIn = () => {
    setShowDialog(false);
    toast.success("Password changed successfully. You are still signed in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-slate-300">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-extrabold text-center text-blue-400 mb-2">Change Password</h2>
        <p className="text-center text-gray-500 mb-6">Keep your account secure by updating your password regularly.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-300 mb-1">
              Old Password
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                name="oldPassword"
                type={showOld ? "text" : "password"}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10 bg-gray-700 border-gray-600 text-slate-300"
                value={form.oldPassword}
                onChange={handleChange}
                autoComplete="current-password"
                required
                placeholder="Enter your old password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                onClick={() => setShowOld((v) => !v)}
              >
                {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? "text" : "password"}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10 bg-gray-700 border-gray-600 text-slate-300"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                placeholder="Enter a new password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10 bg-gray-700 border-gray-600 text-slate-300"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-60"
            disabled={changePasswordStatus === "loading"}
          >
            {changePasswordStatus === "loading" ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Enhanced Success Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
          <div className="bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative transform animate-in fade-in-0 zoom-in-95 duration-300 border border-gray-700">
            {/* Animated background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-pink-100/30 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Close button */}
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 z-10 group"
              aria-label="Close"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Success Content */}
            <div className="px-8 pt-12 pb-8 relative">
              {/* Success Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Main success circle */}
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-300/50 to-transparent rounded-full animate-pulse"></div>
                    <CheckCircle className="w-12 h-12 text-white relative z-10" />
                  </div>
                  
                  {/* Security badge */}
                  <div className="absolute -top-1 -right-1 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute -top-2 -left-2 text-yellow-400 animate-pulse animation-delay-200">
                    <Sparkles size={16} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-blue-400 animate-pulse animation-delay-500">
                    <Sparkles size={12} />
                  </div>
                  
                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-green-300/50 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-green-200/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-8 space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent mb-2">
                  Password Updated!
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Your password has been changed successfully.
                </p>
                <div className="bg-gradient-to-r from-blue-900/10 to-green-900/10 border border-blue-900/20 rounded-xl p-4 mt-4">
                  <div className="flex items-center space-x-2 text-blue-300">
                    <Lock size={16} />
                    <span className="text-sm font-medium">Enhanced Security</span>
                  </div>
                  <p className="text-sm text-blue-400 mt-1">
                    For maximum security, you can choose to sign out from all devices.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleKeepSignedIn}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-base relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Keep me signed in</span>
                    <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                  </span>
                </Button>
                
                <Button
                  onClick={handleSignOutAll}
                  variant="outline"
                  className="w-full border-2 border-red-200 text-red-300 hover:bg-red-900/10 hover:border-red-300 hover:text-red-400 font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-base bg-transparent shadow-sm"
                >
                  Sign out from all devices
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordPage;