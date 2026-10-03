"use client";

import { useState } from "react";

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

          <a href="/" className="footer-logo">
            PRIME<span>NEST</span>
          </a>

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

          <a href="/shop">All Products</a>
          <a href="/men">Men</a>
          <a href="/women">Women</a>
          <a href="/accessories">Accessories</a>
          <a href="/perfume">Perfume</a>

        </div>


        <div className="footer-column">

          <h3>About</h3>

          <a href="/about">Our Story</a>
          <a href="/about">Philosophy</a>
          <a href="/journal">Journal</a>
          <a href="/contact">Contact</a>

        </div>


        <div className="footer-column">

          <h3>Help</h3>

          <a href="/shipping">Shipping & Returns</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>

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