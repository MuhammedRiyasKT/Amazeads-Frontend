"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import styles from "./login.module.css";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleRoutes: Record<string, string> = {
    admin: "/admin",
    sales: "/sales",
    "project manager": "/project-manager",
    manager: "/manager",
    designing: "/projects",
    printing: "/tasks",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login({
        email: cleanEmail,
        password: cleanPassword,
      });

      setAuth(data.access_token, data.staff_profile);

      document.cookie = "isLoggedIn=true; path=/";

      // Safe role handling
      const role =
        data?.staff_profile?.role_name?.toLowerCase() || "";

      // Redirect based on role
      router.push(roleRoutes[role] || "/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Invalid email or password"
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logoText}>AM</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Enter your credentials to access your portal
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          {/* Email Field */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>

            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />

              <input
                type="email"
                placeholder="Enter your email"
                className={styles.input}
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordLabelRow}>
              <label className={styles.label}>Password</label>
              <a href="#" className={styles.forgotLink}>
                Forgot?
              </a>
            </div>

            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={styles.input}
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}