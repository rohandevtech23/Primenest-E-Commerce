"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, ArrowRight, Lock, Sparkles, Check } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    isCartLoaded,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  if (!isCartLoaded) {
    return (
      <>
        <Navbar />
        <main className="cart-page">
          <div className="cart-loading-state">
            <div className="cart-loading-spinner" />
            <p>Loading your shopping bag...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        {/* HEADER */}
        <section className="cart-header">
          <div className="cart-header-kicker">
            <Sparkles size={13} className="text-amber-600" />
            <span>PRIMENEST / YOUR BAG</span>
          </div>

          <h1>
            Shopping <em>Bag.</em>
          </h1>

          <p className="cart-header-text">
            Review your selected designer pieces before completing your order.
          </p>
        </section>

        {cart.length === 0 ? (
          /* EMPTY CART */
          <section className="empty-cart">
            <div className="empty-cart-icon">♡</div>

            <h2>
              Your bag is <em>empty.</em>
            </h2>

            <p>Discover hand-crafted pieces curated for timeless luxury.</p>

            <Link href="/shop" className="checkout-button is-compact">
              <span className="checkout-btn-text">Explore Collection</span>
              <span className="checkout-btn-arrow">
                <ArrowRight size={16} />
              </span>
            </Link>
          </section>
        ) : (
          /* CART WITH PRODUCTS */
          <section className="cart-layout">
            {/* PRODUCTS */}
            <div className="cart-products">
              <div className="cart-products-top">
                <span>
                  {cart.length} {cart.length === 1 ? "PIECE SELECTED" : "PIECES SELECTED"}
                </span>

                <span>ATELIER CURATED COLLECTION</span>
              </div>

              {cart.map((item) => {
                const price = Number(
                  String(item.price).replace(/[₹,]/g, "")
                );
                const itemKey = item.cartItemId || `${item.id}-${item.variantLabel || ""}`;

                return (
                  <article className="cart-item" key={itemKey}>
                    <div className="cart-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-header-meta">
                        <p className="cart-item-category">{item.category}</p>
                        {item.variantLabel && (
                          <span className="cart-item-size-pill">
                            Size: {item.variantLabel}
                          </span>
                        )}
                      </div>

                      <h2>{item.name}</h2>

                      <p className="cart-item-price">
                        {typeof item.price === "number" ? formatPrice(item.price) : item.price}
                      </p>

                      <div className="cart-item-controls">
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() => removeFromCart(itemKey)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      {formatPrice(price * item.quantity)}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* SUMMARY */}
            <aside className="cart-summary">
              <div className="summary-kicker-row">
                <span className="summary-label">ORDER SUMMARY</span>
                <span className="summary-item-count">{cart.length} {cart.length === 1 ? "Item" : "Items"}</span>
              </div>

              <h2>
                Your <em>Order.</em>
              </h2>

              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span className="summary-shipping-badge">
                  <Check size={12} /> Complimentary
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              {/* Animated Proceed to Checkout Button */}
              <Link href="/checkout" className="checkout-button">
                <span className="checkout-btn-text">Proceed to Checkout</span>
                <span className="checkout-btn-arrow">
                  <ArrowRight size={17} />
                </span>
              </Link>

              <Link href="/shop" className="summary-continue">
                ← Continue Shopping
              </Link>

              <div className="secure-checkout">
                <div className="secure-checkout-icon">
                  <ShieldCheck size={22} />
                </div>

                <div className="secure-checkout-content">
                  <strong>Guaranteed Secure Checkout</strong>
                  <p>
                    256-bit bank-grade encryption & tamper-evident white-glove dispatch.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </>
  );
}