"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Truck,
  RotateCcw,
  Heart,
  Trash2,
  ShoppingBag,
  Tag,
  ChevronRight,
  Gift,
  Lock,
  X,
} from "lucide-react";
import "./cart-luxury.css";

export default function CartPage() {
  const {
    cart,
    isCartLoaded,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const { addToWishlist } = useWishlist();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Format currency helper
  const formatPrice = (price) => {
    const val = Number(price) || 0;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Promo discount logic
  const handleApplyPromo = (e) => {
    e?.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "PRIME10" || code === "ATELIER10") {
      const discountAmount = Math.round(cartTotal * 0.1);
      setAppliedPromo({
        code,
        discount: discountAmount,
        label: "10% Luxury Privilege",
      });
      toast.success("Privilege Code Applied! ✨", {
        description: `You've saved ${formatPrice(discountAmount)} on this order.`,
      });
      setPromoCode("");
    } else if (code === "WELCOME500") {
      const discountAmount = Math.min(500, cartTotal);
      setAppliedPromo({
        code,
        discount: discountAmount,
        label: "₹500 Welcome Courtesy",
      });
      toast.success("Welcome Voucher Applied! 🎁", {
        description: `Enjoy ${formatPrice(discountAmount)} courtesy of PrimeNest.`,
      });
      setPromoCode("");
    } else {
      toast.error("Invalid Code", {
        description: "Please enter a valid privilege code (e.g. PRIME10).",
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast("Privilege code removed.");
  };

  // Move item to wishlist
  const handleMoveToWishlist = (item, itemKey) => {
    addToWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      slug: item.slug,
    });
    removeFromCart(itemKey);
    toast.success("Saved to Wishlist! 💖", {
      description: `${item.name} has been moved to your private collection.`,
    });
  };

  // Remove Item Confirmation Modal State (Cancel / OK)
  const [itemPendingRemoval, setItemPendingRemoval] = useState(null);

  const handleConfirmItemRemoval = () => {
    if (!itemPendingRemoval) return;
    const targetItem = itemPendingRemoval;
    const itemKey =
      targetItem.cartItemId ||
      (targetItem.variantLabel
        ? `${targetItem.id}-${targetItem.variantLabel}`
        : targetItem.id);

    removeFromCart(itemKey);
    removeFromCart(targetItem.id);
    setItemPendingRemoval(null);

    toast.success("Item removed from bag", {
      description: `${targetItem.name} has been removed from your shopping bag.`,
      icon: "🗑️",
    });
  };

  // Free shipping threshold (₹2,000)
  const FREE_SHIPPING_THRESHOLD = 2000;
  const shippingProgress = Math.min(
    100,
    Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartTotal
  );

  // Final total
  const finalTotal = Math.max(0, cartTotal - (appliedPromo?.discount || 0));

  if (!isCartLoaded) {
    return (
      <>
        <Navbar />
        <main className="cart-luxury-page">
          <div className="cart-loading-state">
            <div className="cart-loading-spinner" />
            <p>Accessing your private shopping bag...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-luxury-page">
        {/* Ambient floating gold aura */}
        <div className="cart-ambient-orb" />

        {/* 1. LUXURY EDITORIAL HEADER */}
        <section className="cart-luxury-header">
          <div className="cart-eyebrow-badge">
            <Sparkles size={12} className="cart-eyebrow-sparkle" />
            <span>PRIMENEST ATELIER • SHOPPING BAG</span>
          </div>

          <h1>
            Shopping <em>Bag.</em>
          </h1>

          <div className="cart-luxury-divider">
            <span className="cart-luxury-divider-line" />
            <span className="cart-luxury-divider-diamond">◆</span>
            <span className="cart-luxury-divider-line" />
          </div>

          <p className="cart-luxury-intro">
            Review your selected designer pieces before completing your white-glove order.
          </p>
        </section>

        {/* 2. CHECKOUT JOURNEY STEPPER DOCK */}
        {cart.length > 0 && (
          <div className="cart-stepper-dock" aria-label="Checkout Progress">
            <div className="cart-step-item active">
              <span className="cart-step-badge">1</span>
              <span>Shopping Bag</span>
            </div>
            <span className="cart-step-arrow">➔</span>
            <div className="cart-step-item">
              <span className="cart-step-badge">2</span>
              <span>Delivery Details</span>
            </div>
            <span className="cart-step-arrow">➔</span>
            <div className="cart-step-item">
              <span className="cart-step-badge">3</span>
              <span>Payment & Confirmation</span>
            </div>
          </div>
        )}

        {/* 3. EMPTY BAG STATE */}
        {cart.length === 0 ? (
          <section className="cart-empty-luxury">
            <div className="cart-empty-icon-wrap">
              <ShoppingBag size={40} />
            </div>

            <h2>
              Your bag is currently <em>empty.</em>
            </h2>

            <p>
              Discover hand-crafted apparel, artisanal perfumery, and exclusive designer footwear curated for modern living.
            </p>

            <Link href="/shop" className="cart-empty-btn">
              <span>Explore Master Collection</span>
              <ArrowRight size={16} />
            </Link>

            <div className="cart-empty-category-row">
              <Link href="/shop?category=perfume" className="cart-empty-cat-pill">
                ✨ Niche Perfumes
              </Link>
              <Link href="/shop?category=footwear" className="cart-empty-cat-pill">
                👟 Footwear
              </Link>
              <Link href="/shop?category=men" className="cart-empty-cat-pill">
                👔 Men's Couture
              </Link>
              <Link href="/shop?category=women" className="cart-empty-cat-pill">
                👗 Women's Collection
              </Link>
              <Link href="/shop?category=accessories" className="cart-empty-cat-pill">
                ⌚ Accessories
              </Link>
            </div>
          </section>
        ) : (
          /* 4. ACTIVE CART WITH PRODUCTS */
          <>
            {/* Complimentary White-Glove Shipping Progress Bar */}
            <div className="cart-shipping-banner">
              <div className="cart-shipping-header">
                <div className="cart-shipping-msg">
                  <Truck size={17} className="cart-shipping-icon" />
                  {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span>
                      <strong>Privilege Unlocked:</strong> You qualify for <strong>Complimentary White-Glove Express Shipping</strong>!
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more to unlock <strong>Complimentary White-Glove Shipping</strong>.
                    </span>
                  )}
                </div>

                <span className="cart-shipping-status-pill">
                  {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                    <>
                      <Check size={12} /> Complied (100%)
                    </>
                  ) : (
                    `${shippingProgress}% Unlocked`
                  )}
                </span>
              </div>

              <div className="cart-shipping-progress-track">
                <div
                  className="cart-shipping-progress-fill"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <section className="cart-luxury-layout">
              {/* LEFT COLUMN: CART ITEMS */}
              <div className="cart-items-column">
                <div className="cart-items-topbar">
                  <span className="cart-items-count-badge">
                    <Sparkles size={13} className="text-amber-600" />
                    {cart.length} {cart.length === 1 ? "PIECE SELECTED" : "PIECES SELECTED"}
                  </span>
                  <span className="cart-curated-tag">ATELIER CURATED ARCHIVE</span>
                </div>

                {cart.map((item, idx) => {
                  const unitPrice = Number(
                    String(item.price ?? "").replace(/[₹,\s]/g, "")
                  );
                  const validUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
                  const lineTotal = validUnitPrice * Number(item.quantity || 1);
                  const itemKey =
                    item.cartItemId ||
                    `${item.id}-${item.variantLabel || ""}`;
                  const productUrl = `/product/${item.slug || item.id}`;

                  return (
                    <article
                      className="cart-card-luxury"
                      key={itemKey}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      {/* Product Thumbnail */}
                      <Link href={productUrl} className="cart-card-image-wrap">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="cart-card-no-image">No Visual</span>
                        )}
                      </Link>

                      {/* Product Details & Stepper */}
                      <div className="cart-card-info">
                        <div className="cart-card-meta-row">
                          {item.category && (
                            <span className="cart-card-category-pill">
                              {item.category}
                            </span>
                          )}

                          {item.variantLabel && (
                            <span className="cart-card-variant-pill">
                              Size: {item.variantLabel}
                            </span>
                          )}

                          <span className="cart-card-stock-indicator">
                            <span className="cart-stock-dot" />
                            Ready to Dispatch
                          </span>
                        </div>

                        <h2 className="cart-card-title">
                          <Link href={productUrl}>{item.name}</Link>
                        </h2>

                        <div className="cart-card-unit-price">
                          Unit: {formatPrice(validUnitPrice)}
                        </div>

                        {/* Controls: Capsule Stepper + Actions */}
                        <div className="cart-card-controls-row">
                          <div className="cart-quantity-capsule">
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(itemKey, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              title="Decrease"
                            >
                              −
                            </button>

                            <span className="cart-qty-number">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(itemKey, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-card-actions">
                            <button
                              type="button"
                              className="cart-action-btn wishlist"
                              onClick={() => handleMoveToWishlist(item, itemKey)}
                              title="Save to Wishlist"
                            >
                              <Heart size={13} />
                              <span>Save for Later</span>
                            </button>

                            <button
                              type="button"
                              className="cart-action-btn remove"
                              onClick={() => setItemPendingRemoval(item)}
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="cart-card-total-col">
                        <span className="cart-card-total-label">Subtotal</span>
                        <div className="cart-card-total-amount">
                          {formatPrice(lineTotal)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: DELUXE ORDER SUMMARY */}
              <aside className="cart-summary-luxury">
                <div className="cart-summary-header">
                  <span className="cart-summary-eyebrow">ORDER SUMMARY</span>
                  <span className="cart-summary-count-badge">
                    {cart.length} {cart.length === 1 ? "Piece" : "Pieces"}
                  </span>
                </div>

                <h2 className="cart-summary-title">
                  Your <em>Order.</em>
                </h2>

                <div className="cart-summary-breakdown">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>

                  <div className="cart-summary-row">
                    <span>White-Glove Delivery</span>
                    <span className="cart-shipping-free-tag">
                      <Check size={11} /> COMPLIMENTARY
                    </span>
                  </div>

                  <div className="cart-summary-row">
                    <span>Atelier Gift Packaging</span>
                    <span className="font-semibold text-stone-800">
                      Complimentary 🎁
                    </span>
                  </div>

                  <div className="cart-summary-row">
                    <span>Estimated Taxes (GST)</span>
                    <span className="text-stone-500 font-medium text-xs">
                      Included in Price
                    </span>
                  </div>

                  {appliedPromo && (
                    <div className="cart-summary-row text-emerald-700">
                      <span>Privilege ({appliedPromo.code})</span>
                      <span className="font-bold">
                        −{formatPrice(appliedPromo.discount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Promo Code Voucher Accordion */}
                <div className="cart-promo-box">
                  {appliedPromo ? (
                    <div className="cart-promo-success-pill">
                      <span>
                        💎 <strong>{appliedPromo.code}</strong> applied ({appliedPromo.label})
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="cart-promo-remove"
                        title="Remove promo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="cart-promo-trigger"
                        onClick={() => setShowPromoInput(!showPromoInput)}
                      >
                        <span className="flex items-center gap-1.5">
                          <Tag size={13} /> Have a Privilege Code?
                        </span>
                        <span>{showPromoInput ? "▲" : "▼"}</span>
                      </button>

                      {showPromoInput && (
                        <form
                          onSubmit={handleApplyPromo}
                          className="cart-promo-input-group"
                        >
                          <input
                            type="text"
                            placeholder="e.g. PRIME10"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="cart-promo-input"
                          />
                          <button type="submit" className="cart-promo-btn">
                            Apply
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>

                <div className="cart-summary-divider" />

                {/* Grand Total */}
                <div className="cart-summary-grand-total">
                  <div className="cart-total-label-wrap">
                    <span className="cart-total-main-label">Estimated Total</span>
                    <span className="cart-total-tax-note">All duties and duties included</span>
                  </div>
                  <strong className="cart-grand-total-amount">
                    {formatPrice(finalTotal)}
                  </strong>
                </div>

                {/* Proceed to Checkout Luxury CTA */}
                <Link href="/checkout" className="cart-checkout-btn-luxury">
                  <span>Proceed to Checkout</span>
                  <span className="cart-checkout-btn-arrow">
                    <ArrowRight size={17} />
                  </span>
                </Link>

                <Link href="/shop" className="cart-continue-link">
                  <ArrowLeft size={13} />
                  <span>Continue Exploring Atelier</span>
                </Link>

                {/* 3-Point Luxury Assurance Stack */}
                <div className="cart-trust-stack">
                  <div className="cart-trust-item">
                    <ShieldCheck size={18} className="cart-trust-icon" />
                    <div>
                      <h4 className="cart-trust-title">Guaranteed Bank-Grade Security</h4>
                      <p className="cart-trust-desc">
                        256-bit encrypted checkout with verified zero-fraud monitoring.
                      </p>
                    </div>
                  </div>

                  <div className="cart-trust-item">
                    <Truck size={18} className="cart-trust-icon" />
                    <div>
                      <h4 className="cart-trust-title">Insured White-Glove Dispatch</h4>
                      <p className="cart-trust-desc">
                        Hand-packaged in signature gift boxes with tamper-evident seals.
                      </p>
                    </div>
                  </div>

                  <div className="cart-trust-item">
                    <RotateCcw size={18} className="cart-trust-icon" />
                    <div>
                      <h4 className="cart-trust-title">7-Day Complimentary Returns</h4>
                      <p className="cart-trust-desc">
                        Effortless doorstep collection and immediate refund turnaround.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      {/* =======================================================
          REMOVE ITEM CONFIRMATION MODAL (Cancel / OK)
      ======================================================= */}
      {itemPendingRemoval && (
        <div
          className="myntra-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setItemPendingRemoval(null);
          }}
          style={{ zIndex: 99999 }}
        >
          <div
            className="checkout-remove-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-remove-dialog-title"
          >
            <div className="checkout-remove-modal-header">
              <div className="checkout-remove-header-left">
                <div className="checkout-remove-icon-wrap">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 id="cart-remove-dialog-title">Remove Item from Bag?</h3>
                  <p className="checkout-remove-subtitle">
                    Are you sure you want to remove this item from your shopping bag?
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="checkout-remove-close-btn"
                onClick={() => setItemPendingRemoval(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Item Preview */}
            <div className="checkout-remove-item-preview">
              <div className="checkout-remove-item-thumb">
                {itemPendingRemoval.image ? (
                  <img
                    src={itemPendingRemoval.image}
                    alt={itemPendingRemoval.name}
                  />
                ) : (
                  <span>PN</span>
                )}
              </div>
              <div className="checkout-remove-item-info">
                {itemPendingRemoval.category && (
                  <span className="checkout-remove-category">
                    {itemPendingRemoval.category}
                  </span>
                )}
                <h4 className="checkout-remove-name">{itemPendingRemoval.name}</h4>
                <div className="checkout-remove-pricing">
                  <span className="checkout-remove-price">
                    {formatPrice(
                      Number(String(itemPendingRemoval.price).replace(/[₹,]/g, "")) *
                        Number(itemPendingRemoval.quantity || 1)
                    )}
                  </span>
                  {Number(itemPendingRemoval.quantity) > 1 && (
                    <span className="checkout-remove-qty">
                      Qty: {itemPendingRemoval.quantity}
                    </span>
                  )}
                  {itemPendingRemoval.variantLabel && (
                    <span className="checkout-remove-size">
                      Size: {itemPendingRemoval.variantLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="checkout-remove-notice">
              This piece will be removed from your shopping bag and subtotal will be updated automatically.
            </p>

            {/* Cancel & OK Action Buttons */}
            <div className="checkout-remove-modal-actions">
              <button
                type="button"
                className="checkout-remove-btn-cancel"
                onClick={() => setItemPendingRemoval(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="checkout-remove-btn-ok"
                onClick={handleConfirmItemRemoval}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}