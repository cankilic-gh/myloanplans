"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowRight, CheckCircle, ArrowLeft, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [demoCode, setDemoCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Get email from sessionStorage and load dev code if available
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verificationEmail");
    const devCode = sessionStorage.getItem("devVerificationCode");
    const emailWasSent = sessionStorage.getItem("emailSent") === "true";
    
    if (storedEmail) {
      setEmail(storedEmail);
    }
    
    // Only show demo code if email was NOT sent (fallback mode)
    if (!emailWasSent && devCode) {
      setDemoCode(devCode);
    }
    // Don't set demoCode if email was successfully sent
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char));
    
    if (digits.length === 6) {
      setCode(digits);
      // Focus last input
      const lastInput = document.getElementById(`code-5`);
      lastInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      const emailToVerify = email || sessionStorage.getItem("verificationEmail") || "";
      
      if (!emailToVerify) {
        setError("Email not found. Please sign up again.");
        setIsLoading(false);
        return;
      }

      // Get stored code from sessionStorage (for serverless environments)
      const storedCode = sessionStorage.getItem("devVerificationCode");
      const storedCodeExpiresAt = sessionStorage.getItem("codeExpiresAt");

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToVerify,
          code: verificationCode,
          // Include client-side code for serverless environments
          clientCode: storedCode || undefined,
          codeExpiresAt: storedCodeExpiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        setIsLoading(false);
        return;
      }

      setIsVerified(true);
      setIsLoading(false);

      // Save user info to sessionStorage for dashboard
      if (data.user) {
        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("userEmail", data.user.email);
        sessionStorage.setItem("isAuthenticated", "true");
      }

      // Clear verification data
      sessionStorage.removeItem("verificationEmail");
      sessionStorage.removeItem("devVerificationCode");

      // Navigate to dashboard after verification (shorter delay)
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh(); // Force refresh to ensure navigation
      }, 1500);
    } catch (error) {
      console.error("Verification error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || sessionStorage.getItem("verificationEmail"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend code");
        setIsLoading(false);
        return;
      }

      // Update stored code for client-side verification (only if email failed)
      if (!data.emailSent && data.verificationCode) {
        sessionStorage.setItem("devVerificationCode", data.verificationCode);
        setDemoCode(data.verificationCode);
      }
      if (!data.emailSent && data.codeExpiresAt) {
        sessionStorage.setItem("codeExpiresAt", data.codeExpiresAt.toString());
      }
      
      // Update emailSent flag
      if (data.emailSent !== undefined) {
        sessionStorage.setItem("emailSent", data.emailSent ? "true" : "false");
      }

      setIsLoading(false);
      // Show success message
      alert("New verification code sent to your email!");
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 text-center">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center text-base">
              We've sent a 6-digit verification code to{" "}
              <strong>{email || "your email address"}</strong>.
              Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Demo Code Banner - Show ONLY if email sending failed */}
            {demoCode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    ⚠️ Email Not Sent - Verification Code
                  </p>
                  <p className="text-xs text-blue-700">
                    Email sending failed. Use this code: <strong className="font-mono text-base">{demoCode}</strong>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Auto-fill the code
                    const codeArray = demoCode.split("");
                    setCode(codeArray);
                    // Copy to clipboard
                    navigator.clipboard.writeText(demoCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="h-8 px-3 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Use Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 text-center block">
                  Verification Code
                </Label>
                <div 
                  className="flex gap-2 justify-center"
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // Only numbers
                        handleCodeChange(index, value);
                      }}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label={`Code digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.join("").length !== 6}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Resend"}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}




