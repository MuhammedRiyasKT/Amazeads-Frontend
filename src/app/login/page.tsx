"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User as UserIcon, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import styles from "./login.module.css";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import loginBg from "@/assets/images/login.png";

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
    designing: "/designing",
    printing: "/printing",
    production: "/production",
    logistics: "/logistics",
    hr: "/hr",
    accounts: "/accounts",
    marketing: "/marketing/daily-tasks"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Username and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login({
        email: cleanEmail,
        password: cleanPassword,
      });

      // 1. ഒന്നിലധികം ലോക്കൽസ്റ്റോറേജ് ലൈനുകൾ ഒഴിവാക്കി ഒരൊറ്റ മെത്തേഡ് വഴി ഡാറ്റ സേവ് ചെയ്യുന്നു
      setAuth(data.access_token, data.staff_profile);

      // Middleware സംരക്ഷണത്തിനായി കുക്കി സെറ്റ് ചെയ്യുന്നു
      document.cookie = "isLoggedIn=true; path=/";

      const role = data?.staff_profile?.role_name?.toLowerCase() || "";

      // Role-based redirect — replace() instead of push() so browser Back cannot return to /login
      router.replace(roleRoutes[role] || "/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid credentials");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Left side image and branding overlay */}
      <div className={styles.leftPanel}>
        <Image
          src={loginBg}
          alt="Amaze Background"
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.leftOverlay} />
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>AMAZE</h1>
          <h2 className={styles.brandSubtitle}>CREATIVE VENTURES PVT</h2>
          <p className={styles.brandTagline}>INNOVATION THROUGH CREATIVITY</p>
          <div className={styles.brandDivider} />
          <p className={styles.brandFooter}>Enterprise Resource Planning System</p>
        </div>
      </div>

      {/* Right side login form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Log In</h1>
            <p className={styles.subtitle}>Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrapper}>
                <UserIcon className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  placeholder="Enter username"
                  className={styles.input}
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}