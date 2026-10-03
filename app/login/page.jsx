"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, Sparkles, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const followerRef = useRef(null);
  const coreRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Mouse Light Interactive Tracking on the card
  function handleCardMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }

  function handleCardMouseEnter() {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mouse-opacity", "1");
  }

  function handleCardMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mouse-opacity", "0");
  }

  // Golden Light Following Cursor Animation & Ambient Floating Sparks
  useEffect(() => {
    let mouse = {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 400,
      active: true,
    };
    let follower = { x: mouse.x, y: mouse.y };
    let core = { x: mouse.x, y: mouse.y };
    let animationFrameId;

    const handlePointerMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Smooth Lerp loop for the golden light follower
    const renderFollower = () => {
      // Fluid trailing motion following mouse
      follower.x += (mouse.x - follower.x) * 0.12;
      follower.y += (mouse.y - follower.y) * 0.12;

      core.x += (mouse.x - core.x) * 0.25;
      core.y += (mouse.y - core.y) * 0.25;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${follower.x - 210}px, ${follower.y - 210}px, 0)`;
        followerRef.current.style.opacity = "1";
      }

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${core.x - 14}px, ${core.y - 14}px, 0)`;
        coreRef.current.style.opacity = "1";
      }

      animationFrameId = requestAnimationFrame(renderFollower);
    };

    renderFollower();

    // Floating Golden Sparks / Embers on Canvas
    const canvas = canvasRef.current;
    let sparksCtx = null;
    let sparksFrameId = null;

    if (canvas) {
      sparksCtx = canvas.getContext("2d");
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };

      window.addEventListener("resize", handleResize);

      // Generate 38 ambient golden sparks
      const sparks = Array.from({ length: 38 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.7 + 0.2,
        pulsing: Math.random() * 0.02 + 0.01,
      }));

      const renderSparks = () => {
        if (!sparksCtx) return;
        sparksCtx.clearRect(0, 0, width, height);

        for (let spark of sparks) {
          spark.y -= spark.speedY;
          spark.x += spark.speedX;
          spark.opacity += Math.sin(Date.now() * 0.002) * spark.pulsing;

          if (spark.opacity < 0.1) spark.opacity = 0.1;
          if (spark.opacity > 0.9) spark.opacity = 0.9;

          // Wrap around top/bottom
          if (spark.y < -10) {
            spark.y = height + 10;
            spark.x = Math.random() * width;
          }
          if (spark.x < -10) spark.x = width + 10;
          if (spark.x > width + 10) spark.x = -10;

          // Draw glowing golden ember
          sparksCtx.beginPath();
          sparksCtx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          sparksCtx.fillStyle = `rgba(251, 191, 36, ${spark.opacity})`;
          sparksCtx.shadowColor = "#f59e0b";
          sparksCtx.shadowBlur = spark.size * 5;
          sparksCtx.fill();
        }

        sparksFrameId = requestAnimationFrame(renderSparks);
      };

      renderSparks();

      return () => {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
        if (sparksFrameId) cancelAnimationFrame(sparksFrameId);
      };
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || loginSuccess) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Server error. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      setLoginSuccess(true);
      toast.success("Login successful!", {
        description: `Welcome back, ${data.user?.name || "Customer"}!`,
      });

      setTimeout(() => {
        router.replace(redirectTarget);
        router.refresh();
      }, 900);
    } catch (error) {
      toast.error("Login failed", {
        description: error.message || "Please check your details and try again.",
      });
      setLoading(false);
    }
  }

  const [socialLoading, setSocialLoading] = useState(null);
  const [socialModal, setSocialModal] = useState(null);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const providerMeta = {
    google: {
      name: "Google",
      badge: "Google Account",
      defaultName: "Rohan Sharma",
      defaultEmail: "rohan.google@gmail.com",
      avatarBg: "#EA4335",
      btnBg: "#ffffff",
      btnColor: "#1f1f1f",
      btnText: "Continue as Rohan Sharma",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      ),
    },
    apple: {
      name: "Apple",
      badge: "Apple ID",
      defaultName: "Rohan Sharma",
      defaultEmail: "rohan.apple@icloud.com",
      avatarBg: "#1c1c1e",
      btnBg: "#ffffff",
      btnColor: "#000000",
      btnText: "Continue with Apple ID",
      icon: (
        <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.87-9.02-10.43-19.34-13.68-30.96-3.26-11.63-4.89-22.95-4.89-33.97 0-14.24 3.48-26.17 10.44-35.8 6.96-9.63 15.8-14.55 26.52-14.77 5.11 0 10.59 1.34 16.44 4.02 5.85 2.68 9.94 4.08 12.28 4.2 1.95-.23 6.32-1.74 13.1-4.53 6.78-2.79 12.52-4.08 17.21-3.87 12.06.87 21.62 5.25 28.67 13.13-10.54 6.42-15.69 15.34-15.46 26.77.22 9.03 3.69 16.63 10.42 22.8 6.72 6.18 14.77 9.87 24.13 11.08-2.28 7.17-5.11 14.56-8.5 22.18zM119.22 31.84c0-7.39 2.61-14.35 7.83-20.87 5.22-6.52 11.63-10.37 19.23-11.55.22 1.3.33 2.49.33 3.58 0 7.28-2.72 14.34-8.15 21.18-5.43 6.84-11.96 10.74-19.59 11.69-.11-1.3-.22-2.4-.33-3.64l.68-.39z" />
        </svg>
      ),
    },
    linkedin: {
      name: "LinkedIn",
      badge: "LinkedIn Profile",
      defaultName: "Rohan Sharma",
      defaultEmail: "rohan.linkedin@pro.com",
      avatarBg: "#0A66C2",
      btnBg: "#0A66C2",
      btnColor: "#ffffff",
      btnText: "Continue with LinkedIn",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  };

  const handleOpenSocialModal = (provider) => {
    if (socialLoading || loading || loginSuccess) return;
    setSocialModal(provider);
    setUseCustomAccount(false);
    setCustomName("");
    setCustomEmail("");
  };

  const handleExecuteSocial = async (provider, emailToUse, nameToUse) => {
    if (socialLoading || loginSuccess) return;
    setSocialLoading(provider);

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          email: emailToUse || providerMeta[provider]?.defaultEmail,
          name: nameToUse || providerMeta[provider]?.defaultName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to sign in with ${providerMeta[provider]?.name || provider}.`);
      }

      setLoginSuccess(true);
      setSocialModal(null);
      toast.success("Login successful!", {
        description: `Welcome, ${data.user?.name || "Customer"}! Signed in with ${providerMeta[provider]?.name || provider}.`,
      });

      setTimeout(() => {
        router.replace(redirectTarget);
        router.refresh();
      }, 900);
    } catch (error) {
      toast.error("Social Sign-In Failed", {
        description: error.message || "Please try again.",
      });
      setSocialLoading(null);
    }
  };

  return (
    <main className="cinematic-login-viewport">
      {/* Background Floating Golden Sparks Canvas */}
      <canvas ref={canvasRef} className="sparks-canvas" />

      {/* Interactive Golden Light Follower Orb */}
      <div ref={followerRef} className="golden-light-follower" aria-hidden="true" />
      <div ref={coreRef} className="golden-light-core" aria-hidden="true" />

      {/* Top Navigation Back to Store */}
      <div className="top-nav-bar">
        <Link href="/" className="back-link">
          <span className="back-arrow">←</span>
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Main Glassmorphic Card Container with Continuous Golden Light Flow */}
      <div className="golden-flow-card-wrapper">
        {/* Continuous Flowing Golden Light Beam & Ambient Bloom */}
        <div className="golden-flow-glow" aria-hidden="true" />
        <div className="golden-flow-beam" aria-hidden="true" />

        <div
          ref={cardRef}
          className={`cinematic-card ${loginSuccess ? "card-success" : ""}`}
          onMouseMove={handleCardMouseMove}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Dynamic Mouse Spotlight Light inside card */}
          <div className="card-spotlight" />

          {/* Card Header */}
          <div className="card-header">
            <h1 className="title-heading">
              Welcome <span className="title-gold">Back</span>
            </h1>
            <p className="subtitle-text">
              Sign in to continue your journey
            </p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email Address Field */}
            <div className="input-field-block">
              <label htmlFor="user-email" className="field-label">Email Address</label>
              <div className="input-group">
                <div className="input-icon-col">
                  <Mail size={18} className="input-icon" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field-input"
                  style={{
                    colorScheme: "dark",
                    WebkitBoxShadow: "0 0 0 1000px #151a27 inset",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-field-block">
              <label htmlFor="user-password" className="field-label">Password</label>
              <div className="input-group password-group">
                <div className="input-icon-col">
                  <Lock size={18} className="input-icon" />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="field-input"
                  style={{
                    colorScheme: "dark",
                    WebkitBoxShadow: "0 0 0 1000px #151a27 inset",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password-row">
              <button
                type="button"
                className="forgot-link"
                onClick={() =>
                  toast.info("Password Recovery", {
                    description: "Please contact support to reset your account password.",
                  })
                }
              >
                Forgot Password?
              </button>
            </div>

            {/* Glowing Bronze/Gold Gradient Sign In Button */}
            <button
              type="submit"
              className={`signin-button ${loading ? "loading" : ""} ${loginSuccess ? "success" : ""}`}
              disabled={loading || loginSuccess}
            >
              {loginSuccess ? (
                <span className="btn-content">
                  <Check size={18} className="check-icon" />
                  <span>Signed In Successfully</span>
                </span>
              ) : loading ? (
                <span className="btn-content">
                  <span className="btn-spinner" />
                  <span>Signing In...</span>
                </span>
              ) : (
                <span className="btn-content">
                  <span className="btn-text">Sign In</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </span>
              )}
              <span className="button-shine-sweep" />
            </button>
          </form>

          {/* Divider */}
          <div className="divider-row">
            <span className="divider-line" />
            <span className="divider-text">or continue with</span>
            <span className="divider-line" />
          </div>

          {/* Social Authentication Buttons */}
          <div className="social-buttons-row">
            {/* Google */}
            <button
              type="button"
              className="social-btn google-btn"
              onClick={() => handleOpenSocialModal("google")}
              disabled={socialLoading !== null}
              title="Continue with Google"
              aria-label="Continue with Google"
            >
              {socialLoading === "google" ? (
                <span className="social-spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
            </button>

            {/* Apple */}
            <button
              type="button"
              className="social-btn apple-btn"
              onClick={() => handleOpenSocialModal("apple")}
              disabled={socialLoading !== null}
              title="Continue with Apple"
              aria-label="Continue with Apple"
            >
              {socialLoading === "apple" ? (
                <span className="social-spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 170 170" fill="#ffffff">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.87-9.02-10.43-19.34-13.68-30.96-3.26-11.63-4.89-22.95-4.89-33.97 0-14.24 3.48-26.17 10.44-35.8 6.96-9.63 15.8-14.55 26.52-14.77 5.11 0 10.59 1.34 16.44 4.02 5.85 2.68 9.94 4.08 12.28 4.2 1.95-.23 6.32-1.74 13.1-4.53 6.78-2.79 12.52-4.08 17.21-3.87 12.06.87 21.62 5.25 28.67 13.13-10.54 6.42-15.69 15.34-15.46 26.77.22 9.03 3.69 16.63 10.42 22.8 6.72 6.18 14.77 9.87 24.13 11.08-2.28 7.17-5.11 14.56-8.5 22.18zM119.22 31.84c0-7.39 2.61-14.35 7.83-20.87 5.22-6.52 11.63-10.37 19.23-11.55.22 1.3.33 2.49.33 3.58 0 7.28-2.72 14.34-8.15 21.18-5.43 6.84-11.96 10.74-19.59 11.69-.11-1.3-.22-2.4-.33-3.64l.68-.39z" />
                </svg>
              )}
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              className="social-btn linkedin-btn"
              onClick={() => handleOpenSocialModal("linkedin")}
              disabled={socialLoading !== null}
              title="Continue with LinkedIn"
              aria-label="Continue with LinkedIn"
            >
              {socialLoading === "linkedin" ? (
                <span className="social-spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              )}
            </button>
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            <span className="footer-label">Don't have an account?</span>{" "}
            <Link href="/register" className="signup-link">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Social Authentication Modal */}
      {socialModal && (
        <div
          className="social-modal-overlay"
          onClick={() => {
            if (!socialLoading) setSocialModal(null);
          }}
        >
          <div
            className="social-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="social-modal-close"
              onClick={() => {
                if (!socialLoading) setSocialModal(null);
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="social-modal-badge">
              {providerMeta[socialModal]?.icon}
              <span>{providerMeta[socialModal]?.badge}</span>
            </div>

            <h2 className="social-modal-title">
              Sign in with {providerMeta[socialModal]?.name}
            </h2>
            <p className="social-modal-sub">
              Quickly continue to PrimeNest with your verified profile
            </p>

            {/* Quick 1-Click Profile Card */}
            {!useCustomAccount ? (
              <>
                <div className="social-account-preview">
                  <div
                    className="social-avatar-circle"
                    style={{ background: providerMeta[socialModal]?.avatarBg }}
                  >
                    {providerMeta[socialModal]?.defaultName.charAt(0)}
                  </div>
                  <div className="social-avatar-info">
                    <div className="social-avatar-name">
                      {providerMeta[socialModal]?.defaultName}
                    </div>
                    <div className="social-avatar-email">
                      {providerMeta[socialModal]?.defaultEmail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="social-primary-btn"
                  style={{
                    background: providerMeta[socialModal]?.btnBg,
                    color: providerMeta[socialModal]?.btnColor,
                  }}
                  disabled={socialLoading !== null}
                  onClick={() =>
                    handleExecuteSocial(
                      socialModal,
                      providerMeta[socialModal]?.defaultEmail,
                      providerMeta[socialModal]?.defaultName
                    )
                  }
                >
                  {socialLoading ? (
                    <span className="social-spinner" />
                  ) : (
                    <>
                      <span>{providerMeta[socialModal]?.icon}</span>
                      <span>{providerMeta[socialModal]?.btnText}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="social-custom-toggle"
                  onClick={() => setUseCustomAccount(true)}
                >
                  Or enter your own {providerMeta[socialModal]?.name} email &rarr;
                </button>
              </>
            ) : (
              <form
                className="social-custom-fields"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail) return;
                  handleExecuteSocial(socialModal, customEmail, customName);
                }}
              >
                <input
                  type="text"
                  placeholder="Your Full Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="social-custom-input"
                />
                <input
                  type="email"
                  placeholder={`Your ${providerMeta[socialModal]?.name} Email`}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="social-custom-input"
                />

                <button
                  type="submit"
                  className="social-primary-btn"
                  style={{
                    background: providerMeta[socialModal]?.btnBg,
                    color: providerMeta[socialModal]?.btnColor,
                    marginTop: 8,
                  }}
                  disabled={socialLoading !== null}
                >
                  {socialLoading ? (
                    <span className="social-spinner" />
                  ) : (
                    <span>Sign In with {providerMeta[socialModal]?.name}</span>
                  )}
                </button>

                <button
                  type="button"
                  className="social-custom-toggle"
                  onClick={() => setUseCustomAccount(false)}
                >
                  &larr; Back to default account
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}