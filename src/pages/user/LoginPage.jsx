import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loginUser, logout } from "../../features/auth/authSlice";
import { registerUser } from "../../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { mergeCartItems } from "@/features/cart/cartSlice";

const AuthTogglePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken, loading, error, user } = useSelector(
    (state) => state.auth
  );
  const { items: cartItems } = useSelector((state) => state.cart);
  const { loading: userLoading, error: userError, registrationSuccess } = useSelector(
    (state) => state.user
  );
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "", 
  });

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setFormData({ name: "", email: "", password: "", address: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { 
      const response = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if(response.payload.accessToken){
        dispatch(mergeCartItems({accessToken:response.payload.accessToken, cartItems}));
      }
    } catch (error) {
      toast.error("Login Failed", {
        description: error?.message || "An unknown error occurred.",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await dispatch(registerUser(formData));
    if(response.payload.success){
      toast.success("Registration Successful!", {
        description: "You can now sign in with your new account.",
      });
      setIsSignUp(false); 
      setFormData({ name: "", email: "", password: "", address: "" }); 
    }
  };

  useEffect(() => {

    if (user?.role === "admin") {
      toast.success("Login Successful", {
        description: "Welcome to the Admin Dashboard!",
      });
      navigate("/admin");
    } else if (user?.role === "user") {
      toast.success("Login Successful", {
        description: "Welcome to the Website!",
      });
      navigate("/");
    }

    if (error) {
      toast.error("Login Failed", {
        description: error?.message || "An unknown error occurred.",
      });
      dispatch(logout());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }, [accessToken, user, error, loading, navigate, dispatch]);

  // Effect for handling registration (userSlice)
  useEffect(() => {
    if (registrationSuccess) {
      toast.success("Registration Successful!", {
        description: "You can now sign in with your new account.",
      });
      setIsSignUp(false); 
      setFormData({ name: "", email: "", password: "", address: "" }); 
    }
    if (userError) {
      toast.error("Registration Failed", {
        description: userError || "An unknown error occurred during registration.",
      });
    }
  }, [registrationSuccess, userError, dispatch]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px] relative">
          {/* Left Panel */}
          <div className="lg:w-1/2 bg-gradient-to-br from-black to-gray-600 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 z-0"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full z-0"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white opacity-10 rounded-full z-0"></div>
            <div className="z-10 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {isSignUp ? "Join Us Today!" : "Welcome Back!"}
              </h1>
              <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                {isSignUp
                  ? "Sign up to start your journey with us"
                  : "To keep connected with us please login with your personal info"}
              </p>
              <button
                onClick={toggleMode}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-red-500 transition-all duration-300 transform hover:scale-105"
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    {isSignUp ? "Create Account" : "Sign In"}
                  </h2>
                  <p className="text-gray-600">
                    {isSignUp
                      ? "Fill in your details to get started"
                      : "Enter your credentials to access your account"}
                  </p>
                </div>

                <form
                  onSubmit={isSignUp ? handleRegister : handleLogin}
                >
                  <div className="space-y-6">
                    {isSignUp && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                          required
                        />
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {isSignUp && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Address"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                          required
                        />
                      </div>
                    )}

                    {!isSignUp && (
                      <div className="text-right">
                        <Link
                          to="/forgot-password"
                          className="text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSignUp ? userLoading : loading}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSignUp
                        ? userLoading
                          ? "Registering..."
                          : "SIGN UP"
                        : loading
                        ? "Processing..."
                        : "SIGN IN"}
                    </button>
                  </div>
                </form>

                {/* Social Login */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    {["google", "facebook", "github"].map((icon) => (
                      <button
                        key={icon}
                        onClick={() =>
                          toast.info(`Attempting ${icon} login...`)
                        }
                        className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 transition"
                        title={`Sign in with ${icon}`}
                      >
                        <img
                          src={`/${icon}.svg`}
                          alt={icon}
                          className="w-6 h-6"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTogglePage;
