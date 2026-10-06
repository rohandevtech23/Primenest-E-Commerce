"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return;

    alert("Thank you for joining PrimeNest.");
    setEmail("");
  };

  return (
    <footer className="premium-footer">

      {/* Newsletter */}
      <section className="newsletter">

        <div className="newsletter-content">

          <p className="newsletter-label">
            PRIME NEST / INSIDER
          </p>

          <h2>
            Stay in the
            <em> know.</em>
          </h2>

          <p>
            New collections, thoughtful edits and
            exclusive offers — delivered occasionally.
          </p>

          <form
            className="newsletter-form"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">
              Subscribe
              <span>↗</span>
            </button>
          </form>

        </div>

      </section>


      {/* Main Footer */}
      <div className="footer-main">

        <div className="footer-brand">

          <Link href="/" className="footer-logo">
            PRIME<span>NEST</span>
          </Link>

          <p>
            Modern essentials.
            <br />
            Thoughtfully chosen.
          </p>

          <div className="footer-socials">
            <a href="#">Instagram</a>
            <a href="#">Pinterest</a>
            <a href="#">Facebook</a>
          </div>

        </div>


        <div className="footer-column">

          <h3>Shop</h3>

          <Link href="/shop">All Products</Link>
          <Link href="/shop?category=men">Men</Link>
          <Link href="/shop?category=women">Women</Link>
          <Link href="/shop?category=accessories">Accessories</Link>
          <Link href="/shop?category=perfume">Perfume</Link>

        </div>


        <div className="footer-column">

          <h3>About</h3>

          <Link href="/about">Our Story</Link>
          <Link href="/about">Philosophy</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/contact">Contact</Link>

        </div>


        <div className="footer-column">

          <h3>Help</h3>

          <Link href="/shipping">Shipping & Returns</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>

        </div>

      </div>


      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} PrimeNest. All rights reserved.
        </p>

        <div>
          <span>Secure Checkout</span>
          <span>Made with intention</span>
        </div>

      </div>

    </footer>
  );
}