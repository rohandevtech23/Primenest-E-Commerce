"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const cardRef = useRef(null);

  const [email, setEmail] = useState("admin@primenest.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Mouse Light Interactive Tracking
  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }

  function handleMouseEnter() {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mouse-opacity", "1");
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mouse-opacity", "0");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || loginSuccess) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
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
        throw new Error("Unexpected server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid admin email or password.");
      }

      // Trigger Login Success Animation
      setLoginSuccess(true);
      toast.success("Admin login successful!", {
        description: `Welcome back, ${data.user?.name || "Admin"}!`,
      });

      // Brief pause to display the success animation before navigating
      setTimeout(() => {
        router.replace("/admin");
        router.refresh();
      }, 1000);
    } catch (error) {
      toast.error("Admin login failed", {
        description: error.message || "Please check your credentials.",
      });
      setLoading(false);
    }
  }

  return (
    <main className="milky-login-viewport">
      {/* Ambient background glow orbs */}
      <div className="bg-orb orb-primary" />
      <div className="bg-orb orb-secondary" />

      {/* Card Wrapper with Border Glow */}
      <div className={`milky-card-wrapper ${loginSuccess ? "success-border-glow" : ""}`}>
        <div
          ref={cardRef}
          className={`milky-card ${loginSuccess ? "card-success" : ""}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Mouse Light Interactive Spotlight */}
          <div className="mouse-spotlight" />

          {/* Glass Reflection Sheen & Dynamic Beam */}
          <div className="glass-reflection-sheen" />
          <div className="reflection-beam" />

          {/* Card Content */}
          <div className="card-content-inner">
            {/* Brand Header */}
            <div className="brand-section anim-fade-1">
              <h2 className="brand-logo">
                <span className="brand-prime">Prime</span>
                <span className="brand-nest">Nest</span>
              </h2>
              <div className="brand-tag">E - C O M M E R C E &nbsp; A D M I N</div>
            </div>

            {/* Heading */}
            <div className="title-section anim-fade-2">
              <h1 className="hero-title">Welcome Back</h1>
              <p className="hero-subtitle">
                Sign in to access your e-commerce admin dashboard.
              </p>
            </div>

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Pill Email Input */}
              <div className="pill-input-wrap anim-fade-3">
                <span className="pill-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@primenest.com"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pill-input"
                  required
                  disabled={loading || loginSuccess}
                />
              </div>

              {/* Pill Password Input */}
              <div className="pill-input-wrap anim-fade-4">
                <span className="pill-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pill-input has-toggle"
                  required
                  disabled={loading || loginSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pill-eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || loginSuccess}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Options Row */}
              <div className="form-options-row anim-fade-5">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="native-checkbox"
                    disabled={loading || loginSuccess}
                  />
                  <span className="custom-check-box">
                    {rememberMe && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.8 6.8L9 1.2"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="checkbox-text">Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => toast.info("Default static credentials: admin@primenest.com / admin123")}
                  className="forgot-link"
                  disabled={loading || loginSuccess}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Pill Button with Glow & Shine */}
              <button
                type="submit"
                className={`milky-submit-btn anim-fade-6 ${
                  loginSuccess ? "btn-success" : ""
                } ${loading ? "btn-loading" : ""}`}
                disabled={loading || loginSuccess}
              >
                {loginSuccess ? (
                  <>
                    <span className="btn-label success-label">Access Granted!</span>
                    <span className="arrow-orb success-orb">
                      <Check size={18} strokeWidth={3} />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="btn-label">
                      {loading ? "Authenticating..." : "Sign in to Dashboard"}
                    </span>
                    <span className="arrow-orb">
                      <ArrowRight size={17} strokeWidth={2.5} />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Return to live store */}
            <div className="store-return-row anim-fade-6">
              <Link href="/" className="store-return-link">
                ← Return to live store
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Viewport & Atmospheric Background */
        .milky-login-viewport {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          background: #090d16 url("/images/admin-login-bg.jpg") center center / cover no-repeat fixed;
          font-family: "Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Glowing Background Orbs */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.55;
          animation: floatOrb 10s ease-in-out infinite alternate;
        }

        .orb-primary {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
          top: 10%;
          left: 50%;
          transform: translate(-50%, -10%);
        }

        .orb-secondary {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
          bottom: 5%;
          right: 15%;
          animation-duration: 8s;
        }

        @keyframes floatOrb {
          0% {
            transform: translate(-50%, -10%) scale(0.95);
          }
          100% {
            transform: translate(-48%, -5%) scale(1.05);
          }
        }

        /* 1. Fade + Scale Entrance & 4. Border Glow */
        .milky-card-wrapper {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
          animation: entranceScaleFade 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes entranceScaleFade {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(28px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        /* 4. Border Glow (Pulsing Rim Aura) */
        .milky-card-wrapper::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 42px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(99, 102, 241, 0.55) 25%,
            rgba(56, 189, 248, 0.55) 50%,
            rgba(168, 85, 247, 0.45) 75%,
            rgba(255, 255, 255, 0.85) 100%
          );
          filter: blur(12px);
          opacity: 0.65;
          animation: borderGlowPulse 4s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: -1;
          transition: all 0.5s ease;
        }

        @keyframes borderGlowPulse {
          0% {
            opacity: 0.45;
            filter: blur(10px);
            transform: scale(0.995);
          }
          100% {
            opacity: 0.85;
            filter: blur(16px);
            transform: scale(1.015);
          }
        }

        /* Success Border Glow Shockwave */
        .milky-card-wrapper.success-border-glow::before {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.9) 0%,
            rgba(52, 211, 153, 0.7) 50%,
            rgba(5, 150, 105, 0.9) 100%
          );
          filter: blur(20px);
          opacity: 1;
          transform: scale(1.03);
        }

        /* Milky Frosted White Glass Card */
        .milky-card {
          width: 100%;
          padding: 38px 34px 28px;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.46);
          backdrop-filter: blur(45px) saturate(190%);
          -webkit-backdrop-filter: blur(45px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.78);
          box-shadow:
            0 30px 70px -10px rgba(0, 0, 0, 0.38),
            0 10px 30px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.95);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .milky-card.card-success {
          border-color: rgba(52, 211, 153, 0.85);
          box-shadow:
            0 30px 70px -10px rgba(16, 185, 129, 0.3),
            0 0 40px rgba(16, 185, 129, 0.25),
            inset 0 1px 2px rgba(255, 255, 255, 0.95);
        }

        /* 2. Mouse Light (Cursor Spotlight) */
        .mouse-spotlight {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.38) 0%,
            rgba(255, 255, 255, 0.12) 35%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 1;
          opacity: var(--mouse-opacity, 0);
          transition: opacity 0.3s ease;
        }

        /* 3. Glass Reflection Sheen & Dynamic Beam */
        .glass-reflection-sheen {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.45) 0%,
            rgba(255, 255, 255, 0.15) 28%,
            transparent 42%,
            transparent 65%,
            rgba(255, 255, 255, 0.1) 85%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .reflection-beam {
          position: absolute;
          top: -60%;
          left: -120%;
          width: 60%;
          height: 220%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            rgba(255, 255, 255, 0.45),
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: rotate(26deg);
          pointer-events: none;
          animation: reflectionSweep 7s infinite cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2;
        }

        @keyframes reflectionSweep {
          0%, 35% {
            left: -120%;
          }
          65%, 100% {
            left: 220%;
          }
        }

        /* Card Content Layer */
        .card-content-inner {
          position: relative;
          z-index: 3;
        }

        /* Staggered Fade Up Animations */
        .anim-fade-1 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .anim-fade-2 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
        }
        .anim-fade-3 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.26s both;
        }
        .anim-fade-4 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.34s both;
        }
        .anim-fade-5 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.42s both;
        }
        .anim-fade-6 {
          animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        @keyframes staggerFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Brand Header */
        .brand-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .brand-logo {
          font-size: 27px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .brand-prime {
          color: #0f172a;
        }

        .brand-nest {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tag {
          font-size: 9.5px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 2px;
          margin-top: 4px;
        }

        /* Title & Subtitle */
        .title-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
        }

        .hero-subtitle {
          font-size: 13px;
          color: #475569;
          margin: 0 auto;
          max-width: 330px;
          line-height: 1.45;
          font-weight: 500;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Pill Input Fields */
        .pill-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .pill-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #334155;
          pointer-events: none;
          z-index: 5;
          line-height: 0;
          transition: color 0.2s;
        }

        .pill-input {
          width: 100%;
          height: 50px;
          padding: 0 20px 0 48px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.48);
          border: 1px solid rgba(255, 255, 255, 0.75);
          color: #0f172a;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .pill-input::placeholder {
          color: #64748b;
          font-weight: 400;
        }

        .pill-input:hover {
          background: rgba(255, 255, 255, 0.62);
          border-color: rgba(255, 255, 255, 0.95);
        }

        .pill-input:focus {
          background: rgba(255, 255, 255, 0.82);
          border-color: #6366f1;
          box-shadow:
            0 0 0 3px rgba(99, 102, 241, 0.2),
            inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .pill-input-wrap:focus-within .pill-input-icon {
          color: #4f46e5;
        }

        .pill-input.has-toggle {
          padding-right: 48px;
        }

        .pill-eye-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 4px;
          z-index: 5;
          transition: color 0.15s;
        }

        .pill-eye-btn:hover {
          color: #0f172a;
        }

        /* Checkbox & Forgot Password Row */
        .form-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px;
          font-size: 12.5px;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .native-checkbox {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-check-box {
          width: 17px;
          height: 17px;
          border-radius: 5px;
          background: #4f46e5;
          display: grid;
          place-items: center;
          transition: background 0.15s;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
        }

        .checkbox-text {
          color: #1e293b;
          font-weight: 500;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          font-size: 12.5px;
          padding: 0;
          transition: color 0.15s;
        }

        .forgot-link:hover {
          color: #4338ca;
          text-decoration: underline;
        }

        /* 5. Button Glow & Button Shine + 6. Login Success State */
        .milky-submit-btn {
          margin-top: 4px;
          width: 100%;
          height: 52px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #9333ea 0%, #6366f1 45%, #2563eb 100%);
          border: none;
          color: #ffffff;
          padding: 0 8px 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 8px 24px -2px rgba(99, 102, 241, 0.5),
            0 0 16px rgba(99, 102, 241, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.4);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: buttonGlowBreath 3.5s infinite alternate ease-in-out;
        }

        /* Button Glow Breathing Animation */
        @keyframes buttonGlowBreath {
          0% {
            box-shadow:
              0 8px 22px -2px rgba(99, 102, 241, 0.45),
              0 0 14px rgba(37, 99, 235, 0.25),
              inset 0 1px 1px rgba(255, 255, 255, 0.35);
          }
          100% {
            box-shadow:
              0 14px 32px -2px rgba(99, 102, 241, 0.7),
              0 0 24px rgba(147, 51, 234, 0.45),
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
          }
        }

        /* 5. Button Shine Sweep */
        .milky-submit-btn::after {
          content: "";
          position: absolute;
          top: -60%;
          left: -130%;
          width: 60%;
          height: 220%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.35),
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.35),
            transparent
          );
          transform: rotate(26deg);
          pointer-events: none;
          animation: buttonShineSweep 4s infinite ease-in-out;
        }

        @keyframes buttonShineSweep {
          0%, 60% {
            left: -130%;
          }
          95%, 100% {
            left: 220%;
          }
        }

        .milky-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 16px 36px -4px rgba(99, 102, 241, 0.75),
            0 0 30px rgba(99, 102, 241, 0.5),
            inset 0 1px 1px rgba(255, 255, 255, 0.55);
        }

        .milky-submit-btn:hover::after {
          animation: buttonShineSweep 1.5s ease-in-out;
        }

        .milky-submit-btn:active {
          transform: translateY(0);
        }

        /* 6. Login Success State (Emerald Morph) */
        .milky-submit-btn.btn-success {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          box-shadow:
            0 12px 32px rgba(16, 185, 129, 0.65),
            0 0 25px rgba(16, 185, 129, 0.45),
            inset 0 1px 1px rgba(255, 255, 255, 0.6);
          animation: successPulse 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes successPulse {
          0% {
            transform: scale(0.96);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        .success-label {
          letter-spacing: 0.3px;
        }

        .success-orb {
          color: #059669 !important;
          animation: orbPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes orbPop {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }

        .btn-label {
          font-size: 14.5px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.2px;
          position: relative;
          z-index: 2;
        }

        .arrow-orb {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.25s ease;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .milky-submit-btn:hover .arrow-orb {
          transform: translateX(3px);
        }

        /* Return to store link */
        .store-return-row {
          margin-top: 24px;
          text-align: center;
        }

        .store-return-link {
          font-size: 11.5px;
          color: #475569;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .store-return-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .milky-card {
            padding: 30px 22px 24px;
            border-radius: 30px;
          }

          .hero-title {
            font-size: 23px;
          }
        }
      `}</style>
    </main>
  );
}