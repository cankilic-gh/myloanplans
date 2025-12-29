"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Route guard: redirect if already authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [router]);

  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First check localStorage (development mode)
      if (typeof window !== "undefined") {
        const { getUserByEmail } = await import("@/lib/user-storage");
        const storedUser = getUserByEmail(email);

        if (storedUser) {
          if (storedUser.password === password) {
            // Login successful from localStorage
            sessionStorage.setItem("userName", storedUser.name);
            sessionStorage.setItem("userEmail", storedUser.email);
            sessionStorage.setItem("isAuthenticated", "true");
            router.push("/dashboard");
            setIsLoading(false);
            return;
          } else {
            // Password doesn't match
            setError("Invalid email or password");
            setIsLoading(false);
            return;
          }
        }
        // If user not found in localStorage, continue to API check
      }

      // If not found in localStorage, try API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Login successful - save user info
      if (data.user) {
        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("userEmail", data.user.email);
        sessionStorage.setItem("isAuthenticated", "true");
      }

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(""); // Clear error when user types
                      }}
                      required
                      className={`pl-10 h-11 focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        error ? "border-red-500" : ""
                      }`}
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(""); // Clear error when user types
                      }}
                      required
                      className={`pl-10 h-11 focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        error ? "border-red-500" : ""
                      }`}
                      aria-label="Password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}



