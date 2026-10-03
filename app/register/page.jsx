
"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";



export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(true);

      toast.success("Account created successfully!", {
        description: "Welcome to PrimeNest!",
      });
      router.replace("/login");
      router.refresh();
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error.message || "Please try again.",
      });
} finally {
      setLoading(false);
    }
  }

  return (
    <main className="pn-auth-page">
      <section className="pn-auth-card">
        <Link href="/" className="pn-auth-brand">
          <span className="pn-auth-logo">P</span>
          <span>PrimeNest</span>
        </Link>

        <div className="pn-auth-heading">
          <span className="pn-auth-eyebrow">JOIN PRIMENEST</span>
          <h1>Create your account</h1>
          <p>Join us and discover something special.</p>
        </div>

        <form className="pn-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>
          <div className="pn-auth-password">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="register-confirm">Confirm password</label>
          <div className="pn-auth-password">
            <input
              id="register-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="pn-auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <span>→</span>}
          </button>
          

          {success && (
            <Link
              href="/login"
              className="pn-auth-submit"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Continue to Login →
            </Link>
          )}
        </form>

        <div className="pn-auth-switch">
          <span>Already have an account?</span>
          <Link href="/login">Sign in</Link>
        </div>

        <div className="pn-auth-divider">
          <span>OR</span>
        </div>

        <Link href="/" className="pn-auth-admin-link">
          Continue shopping →
        </Link>

        <p className="pn-auth-terms">
          By creating an account, you agree to our Terms of Service
          and Privacy Policy.
        </p>
      </section>
    </main>
  );
}