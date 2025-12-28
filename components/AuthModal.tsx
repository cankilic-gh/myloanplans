"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/stores/useUIStore";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthModal() {
  const { isAuthModalOpen, authMode, closeAuthModal, setAuthMode } = useUIStore();
  const router = useRouter();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  // Reset all states when modal closes or tab changes
  useEffect(() => {
    if (!isAuthModalOpen) {
      // Reset login state
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
      setIsLoginLoading(false);

      // Reset signup state
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setSignupErrors({});
      setIsSignupLoading(false);
    }
  }, [isAuthModalOpen]);

  // Reset errors when switching tabs
  useEffect(() => {
    setLoginError("");
    setSignupErrors({});
    setIsLoginLoading(false);
    setIsSignupLoading(false);
  }, [authMode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");

    try {
      // First check localStorage (development mode)
      if (typeof window !== "undefined") {
        const { getUserByEmail } = await import("@/lib/user-storage");
        const storedUser = getUserByEmail(loginEmail);

        if (storedUser) {
          if (storedUser.password === loginPassword) {
            // Login successful from localStorage
            sessionStorage.setItem("userName", storedUser.name);
            sessionStorage.setItem("userEmail", storedUser.email);
            sessionStorage.setItem("isAuthenticated", "true");
            closeAuthModal();
            router.push("/dashboard");
            setIsLoginLoading(false);
            return;
          } else {
            // Password doesn't match
            setLoginError("Invalid email or password");
            setIsLoginLoading(false);
            return;
          }
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Invalid credentials");
        setIsLoginLoading(false);
        return;
      }

      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userName", data.user.name);
      sessionStorage.setItem("userEmail", data.user.email);

      closeAuthModal();
      router.push("/dashboard");
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
      setIsLoginLoading(false);
    }
  };

  const validateSignupForm = () => {
    const errors: Record<string, string> = {};

    if (!signupData.name.trim()) errors.name = "Name is required";
    if (!signupData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!signupData.password) {
      errors.password = "Password is required";
    } else if (signupData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setIsSignupLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupErrors({ submit: data.error || "Failed to create account" });
        setIsSignupLoading(false);
        return;
      }

      sessionStorage.setItem("verificationEmail", signupData.email);
      sessionStorage.setItem("userName", signupData.name);
      sessionStorage.setItem("userEmail", signupData.email);

      if (data.verificationCode) {
        sessionStorage.setItem("devVerificationCode", data.verificationCode);
      }
      if (data.codeExpiresAt) {
        sessionStorage.setItem("codeExpiresAt", data.codeExpiresAt.toString());
      }
      sessionStorage.setItem("emailSent", data.emailSent ? "true" : "false");

      closeAuthModal();
      router.push("/verify-email");
    } catch (error) {
      setSignupErrors({ submit: "An error occurred. Please try again." });
      setIsSignupLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            {/* Title and Close Button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <button
                onClick={closeAuthModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  authMode === "login"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  authMode === "signup"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <motion.form
                  key="login"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
                  >
                    {isLoginLoading ? (
                      "Signing in..."
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData({ ...signupData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className={`pl-10 ${signupErrors.name ? "border-red-500" : ""}`}
                      />
                    </div>
                    {signupErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{signupErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({ ...signupData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className={`pl-10 ${signupErrors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{signupErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({ ...signupData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className={`pl-10 ${signupErrors.password ? "border-red-500" : ""}`}
                      />
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{signupErrors.password}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className={`pl-10 ${
                          signupErrors.confirmPassword ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {signupErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                    {signupErrors.submit && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{signupErrors.submit}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSignupLoading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
                  >
                    {isSignupLoading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



