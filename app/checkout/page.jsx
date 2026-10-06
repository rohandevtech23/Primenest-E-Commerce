"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  QrCode,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  UserCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  PackageCheck,
  Tag,
  Gift,
  Heart,
  Plus,
  Edit3,
  Info,
  ChevronDown,
  Trash2,
} from "lucide-react";

// Curated available discount coupons
const AVAILABLE_COUPONS = [
  {
    code: "PRIMENEST10",
    title: "10% FLAT OFF",
    description: "Get 10% discount on all luxury pieces in your shopping bag",
    discountCalc: (total) => Math.round(total * 0.1),
    minOrder: 1000,
  },
  {
    code: "LUXE300",
    title: "FLAT ₹300 OFF",
    description: "Save ₹300 instantly on your order",
    discountCalc: () => 300,
    minOrder: 2000,
  },
  {
    code: "FIRST500",
    title: "WELCOME LUXURY ₹500 OFF",
    description: "Special client welcome discount for orders above ₹4,000",
    discountCalc: () => 500,
    minOrder: 4000,
  },
];

// Quick PIN code lookup map for Indian cities
const PIN_CODE_MAP = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400050": { city: "Mumbai", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "560038": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, isCartLoaded, removeFromCart } = useCart();

  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Primary form data for order submission
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Saved addresses and selection (Myntra-style)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Myntra-style Address Modal Form
  const [addressForm, setAddressForm] = useState({
    name: "",
    mobile: "",
    pincode: "",
    houseNo: "",
    streetAddress: "",
    locality: "",
    city: "",
    state: "",
    addressType: "Home", // "Home" | "Office"
    isDefault: true,
  });

  // Coupons & Discounts State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Gifting & Personalisation State (Screenshot 1)
  const [hasGiftPackaging, setHasGiftPackaging] = useState(false);
  const [showGiftDetails, setShowGiftDetails] = useState(false);
  const [giftDetails, setGiftDetails] = useState({
    recipient: "",
    message: "",
  });

  // Support Transformative Social Work (Donation) State (Screenshot 1)
  const [isDonationActive, setIsDonationActive] = useState(false);
  const [donationAmount, setDonationAmount] = useState(20);
  const [showDonationModal, setShowDonationModal] = useState(false);

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

    toast.success("Item removed from order", {
      description: `${targetItem.name} has been removed from your shopping bag.`,
      icon: "🗑️",
    });
  };

  // Checkout submission & Payment modal state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "cod"
  const [upiId, setUpiId] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Load user session & saved addresses
  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndLoadUserInfo() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (!isMounted) return;
            setCurrentUser(data.user);
            setForm((prev) => ({
              ...prev,
              customerName: prev.customerName || data.user.name || "",
              email: prev.email || data.user.email || "",
              phone: prev.phone || data.user.phone || "",
            }));

            setAddressForm((prev) => ({
              ...prev,
              name: prev.name || data.user.name || "",
              mobile: prev.mobile || data.user.phone || "",
            }));

            // Pre-fill cardholder name
            setCardData((prev) => ({
              ...prev,
              name: prev.name || data.user.name || "",
            }));

            // Fetch saved addresses from database
            try {
              const addrRes = await fetch("/api/profile/addresses", {
                credentials: "include",
                cache: "no-store",
              });
              if (addrRes.ok) {
                const addrData = await addrRes.json();
                const addresses = addrData.addresses || [];
                if (isMounted) {
                  setSavedAddresses(addresses);
                  const defaultAddr =
                    addresses.find((a) => a.is_default) || addresses[0];

                  if (defaultAddr) {
                    const fullAddr = [
                      defaultAddr.address_line,
                      defaultAddr.city,
                      defaultAddr.state,
                      defaultAddr.postal_code,
                      defaultAddr.country,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    setSelectedAddress({
                      id: defaultAddr.id,
                      name: defaultAddr.full_name,
                      mobile: defaultAddr.phone,
                      addressLine: defaultAddr.address_line,
                      city: defaultAddr.city,
                      state: defaultAddr.state,
                      pincode: defaultAddr.postal_code,
                      fullAddress: fullAddr,
                      addressType: "Home",
                      isDefault: defaultAddr.is_default,
                    });

                    setForm((prev) => ({
                      ...prev,
                      address: fullAddr,
                      customerName: defaultAddr.full_name || prev.customerName,
                      phone: defaultAddr.phone || prev.phone,
                    }));
                  }
                }
              }
            } catch {
              // Ignore address fetch error
            }
            return;
          }
        }

        // If not authenticated, redirect to login
        if (isMounted) {
          setCurrentUser(null);
          toast.error("Please sign in to place your order.", {
            description: "You must be logged in to complete payment and track your orders.",
          });
          router.replace("/login?redirect=/checkout");
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          router.replace("/login?redirect=/checkout");
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    }

    checkAuthAndLoadUserInfo();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Format currency in Indian Rupees
  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Dynamic calculations for final order total
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const giftFee = hasGiftPackaging ? 35 : 0;
  const donationFee = isDonationActive ? donationAmount : 0;
  const finalPayable = Math.max(0, cartTotal - discountAmount + giftFee + donationFee);

  // Auto-fill City & State on Pincode entry (Myntra-style)
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setAddressForm((prev) => {
      const updated = { ...prev, pincode: val };
      if (val.length === 6 && PIN_CODE_MAP[val]) {
        updated.city = PIN_CODE_MAP[val].city;
        updated.state = PIN_CODE_MAP[val].state;
      }
      return updated;
    });
  };

  // Open modal to add a fresh new address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: currentUser?.name || form.customerName || "",
      mobile: currentUser?.phone || form.phone || "",
      pincode: "",
      houseNo: "",
      streetAddress: "",
      locality: "",
      city: "",
      state: "",
      addressType: "Home",
      isDefault: savedAddresses.length === 0,
    });
    setShowAddressModal(true);
  };

  // Open modal to edit existing address
  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id || "temp");
    setAddressForm({
      name: addr.name || addr.full_name || form.customerName,
      mobile: addr.mobile || addr.phone || form.phone,
      pincode: addr.pincode || addr.postal_code || "",
      houseNo: addr.houseNo || "",
      streetAddress: addr.streetAddress || addr.address_line || addr.addressLine || "",
      locality: addr.locality || "",
      city: addr.city || "",
      state: addr.state || "",
      addressType: addr.addressType || "Home",
      isDefault: Boolean(addr.isDefault || addr.is_default),
    });
    setShowAddressModal(true);
  };

  // Save address from Myntra-style modal
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (
      !addressForm.name.trim() ||
      !addressForm.mobile.trim() ||
      !addressForm.pincode.trim() ||
      !addressForm.houseNo.trim() ||
      !addressForm.streetAddress.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim()
    ) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (addressForm.pincode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    const fullStreet = `${addressForm.houseNo}, ${addressForm.streetAddress}${
      addressForm.locality ? ", " + addressForm.locality : ""
    }`;
    const fullCombined = `${fullStreet}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode} (${addressForm.addressType})`;

    const newAddrObj = {
      id: editingAddressId || `addr_${Date.now()}`,
      name: addressForm.name,
      mobile: addressForm.mobile,
      houseNo: addressForm.houseNo,
      streetAddress: addressForm.streetAddress,
      locality: addressForm.locality,
      addressLine: fullStreet,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      fullAddress: fullCombined,
      addressType: addressForm.addressType,
      isDefault: addressForm.isDefault,
    };

    // Save to PostgreSQL via API if signed in
    if (currentUser) {
      try {
        const res = await fetch("/api/profile/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: addressForm.name,
            phone: addressForm.mobile,
            addressLine: fullStreet,
            city: addressForm.city,
            state: addressForm.state,
            postalCode: addressForm.pincode,
            country: "India",
            isDefault: addressForm.isDefault,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.address?.id) {
            newAddrObj.id = resData.address.id;
          }
        }
      } catch {
        // Fallback to local state if offline or network error
      }
    }

    // Update state
    setSavedAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== newAddrObj.id);
      return [newAddrObj, ...filtered];
    });

    setSelectedAddress(newAddrObj);
    setForm((prev) => ({
      ...prev,
      customerName: addressForm.name,
      phone: addressForm.mobile,
      address: fullCombined,
    }));

    setShowAddressModal(false);
    toast.success("Delivery address saved successfully! 📍");
  };

  // Select an existing address
  const handleSelectAddress = (addr) => {
    const fullStreet = addr.addressLine || addr.address_line || "";
    const fullCombined = addr.fullAddress || [
      fullStreet,
      addr.city,
      addr.state,
      addr.pincode || addr.postal_code,
      addr.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    const formatted = {
      id: addr.id,
      name: addr.name || addr.full_name || form.customerName,
      mobile: addr.mobile || addr.phone || form.phone,
      addressLine: fullStreet,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode || addr.postal_code,
      fullAddress: fullCombined,
      addressType: addr.addressType || "Home",
      isDefault: addr.isDefault || addr.is_default,
    };

    setSelectedAddress(formatted);
    setForm((prev) => ({
      ...prev,
      customerName: formatted.name,
      phone: formatted.mobile,
      address: fullCombined,
    }));
    setShowAddressPicker(false);
    toast.success(`Delivery address set to ${formatted.name}`);
  };

  // Apply a coupon code
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      setCouponError("Invalid coupon code. Try PRIMENEST10 or LUXE300.");
      return;
    }

    if (cartTotal < found.minOrder) {
      setCouponError(`Minimum order amount of ${formatPrice(found.minOrder)} required.`);
      return;
    }

    const calculatedSavings = found.discountCalc(cartTotal);
    setAppliedCoupon({
      code: found.code,
      title: found.title,
      discount: calculatedSavings,
    });

    setShowCouponModal(false);
    setCouponInput("");
    toast.success(`Coupon applied! You saved ${formatPrice(calculatedSavings)} 🎉`);
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed.");
  };

  // Handle card input changes with auto-formatting
  const handleCardChange = (event) => {
    const { name, value } = event.target;
    let formattedValue = value;

    if (name === "number") {
      const raw = value.replace(/\D/g, "").slice(0, 16);
      formattedValue = raw.replace(/(.{4})/g, "$1 ").trim();
    } else if (name === "expiry") {
      const raw = value.replace(/\D/g, "").slice(0, 4);
      if (raw.length >= 3) {
        formattedValue = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
      } else {
        formattedValue = raw;
      }
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardData({
      ...cardData,
      [name]: formattedValue,
    });
  };

  // Initiate Payment Modal
  const handleOpenPayment = (event) => {
    event.preventDefault();
    setError("");

    if (!currentUser) {
      toast.error("Please sign in to place your order.");
      router.replace("/login?redirect=/checkout");
      return;
    }

    if (cart.length === 0) {
      setError("Your shopping bag is empty.");
      toast.error("Your shopping bag is empty.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please add a delivery destination address.");
      toast.error("Please add a delivery destination address.");
      handleOpenAddAddress();
      return;
    }

    if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in customer contact details.");
      toast.error("Please fill in customer contact details.");
      return;
    }

    if (!cardData.name) {
      setCardData((prev) => ({ ...prev, name: form.customerName }));
    }

    setShowPaymentModal(true);
  };

  // Confirm order execution
  const handleConfirmOrder = async () => {
    setError("");

    if (!currentUser) {
      toast.error("Please sign in to place your order.");
      router.replace("/login?redirect=/checkout");
      return;
    }

    if (paymentMethod === "upi" && !showQr && !upiId.trim()) {
      toast.error("Please enter a valid UPI ID or scan the QR code.");
      return;
    }

    if (paymentMethod === "card") {
      const cleanNum = cardData.number.replace(/\s/g, "");
      if (cleanNum.length < 15) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        toast.error("Please enter valid card expiry (MM/YY).");
        return;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        toast.error("Please enter 3-digit CVV.");
        return;
      }
    }

    try {
      setLoading(true);

      // Append gift instructions to delivery note if packaging is selected
      let finalDeliveryAddress = form.address;
      if (hasGiftPackaging && giftDetails.recipient) {
        finalDeliveryAddress += ` [GIFT PACKAGE FOR: ${giftDetails.recipient}${
          giftDetails.message ? ` - Message: "${giftDetails.message}"` : ""
        }]`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          address: finalDeliveryAddress,
          paymentMethod,
          items: cart.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.replace("/login?redirect=/checkout");
          return;
        }
        throw new Error(data.error || "Unable to place your order.");
      }

      const methodLabel =
        paymentMethod === "upi"
          ? "UPI Payment"
          : paymentMethod === "card"
          ? "Card Payment"
          : "Cash on Delivery";

      toast.success("Order Placed Successfully! 🎉", {
        description: `Order #${data.orderId} confirmed via ${methodLabel}. Thank you!`,
        duration: 5000,
      });

      setConfirmedOrder({
        orderId: data.orderId,
        paymentMethod,
        total: finalPayable,
        customerName: form.customerName,
        email: form.email,
        address: finalDeliveryAddress,
        appliedCoupon,
        hasGiftPackaging,
        donationAmount: isDonationActive ? donationAmount : 0,
      });

      setShowPaymentModal(false);
      clearCart();
    } catch (err) {
      const msg = err.message || "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authChecking || !isCartLoaded) {
    return (
      <>
        <Navbar />
        <main className="checkout-page checkout-loading-viewport">
          <div className="checkout-loading-card">
            <div className="checkout-luxury-spinner">
              <div className="spinner-ring" />
              <span className="spinner-monogram">PN</span>
            </div>
            <p className="checkout-loading-eyebrow">PRIMENEST ATELIER</p>
            <h3 className="checkout-loading-title">Securing Your Session</h3>
            <p className="checkout-loading-desc">
              Verifying encrypted credentials and preparing white-glove checkout...
            </p>
          </div>
        </main>
      </>
    );
  }

  // Not logged in prompt
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <section className="checkout-auth-prompt-card">
            <div className="auth-prompt-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <p className="checkout-eyebrow">MEMBERSHIP ACCESS REQUIRED</p>
            <h2>Please Sign In to Complete Order</h2>
            <p className="auth-prompt-desc">
              To ensure 256-bit secure checkout, authenticity protection, and real-time shipment tracking, please sign in to your PrimeNest account.
            </p>
            <Link
              href="/login?redirect=/checkout"
              className="checkout-submit is-inline"
            >
              <span className="checkout-btn-text">Sign In to Continue</span>
              <span className="checkout-btn-arrow"><ArrowRight size={16} /></span>
            </Link>
          </section>
        </main>
      </>
    );
  }

  // Confirmation view
  if (confirmedOrder) {
    const isCod = confirmedOrder.paymentMethod === "cod";
    const isUpi = confirmedOrder.paymentMethod === "upi";

    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <section className="checkout-success-atelier">
            <div className="success-badge-glow">
              <CheckCircle2 size={44} />
            </div>

            <p className="checkout-eyebrow">PRIMENEST / ORDER CONFIRMED</p>
            <h1>Your Order is <em>Confirmed.</em></h1>
            <p className="success-subtext">
              Thank you, {confirmedOrder.customerName}. Your bespoke order has been registered and is being prepared with white-glove precision.
            </p>

            <div className="success-order-pill">
              <span className="pill-label">ORDER REFERENCE</span>
              <span className="pill-code">#{confirmedOrder.orderId}</span>
            </div>

            <div className="success-summary-card">
              <div className="summary-card-header">
                <PackageCheck size={18} className="text-amber-600" />
                <span>Order Summary & Dispatch Details</span>
              </div>

              <div className="summary-detail-grid">
                <div>
                  <label>DELIVERY RECIPIENT</label>
                  <p className="detail-primary">{confirmedOrder.customerName}</p>
                  <p className="detail-secondary">{confirmedOrder.email}</p>
                </div>

                <div>
                  <label>PAYMENT STATUS</label>
                  <div className="payment-status-badge">
                    {isCod ? (
                      <>
                        <Truck size={14} /> Cash / UPI on Delivery
                      </>
                    ) : isUpi ? (
                      <>
                        <Smartphone size={14} /> Paid via UPI Verified
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} /> Paid via Card Verified
                      </>
                    )}
                  </div>
                </div>

                <div className="span-full">
                  <label>DESTINATION ADDRESS</label>
                  <p className="detail-secondary">{confirmedOrder.address}</p>
                </div>

                {confirmedOrder.hasGiftPackaging && (
                  <div className="span-full">
                    <label>GIFT PACKAGING INCLUDED</label>
                    <p className="detail-secondary text-pink-600 font-medium">
                      ✓ Premium Gift Box with Personalized Greeting Card
                    </p>
                  </div>
                )}

                <div className="span-full total-highlight">
                  <label>TOTAL AMOUNT PAID / PAYABLE</label>
                  <p className="detail-price">{formatPrice(confirmedOrder.total)}</p>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <Link href="/shop" className="checkout-submit is-inline">
                <span className="checkout-btn-text">Continue Shopping</span>
                <span className="checkout-btn-arrow"><ArrowRight size={16} /></span>
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        {/* EDITORIAL LUXURY HEADER */}
        <header className="checkout-heading">
          <div className="checkout-eyebrow-badge">
            <Lock size={12} />
            <span>PRIMENEST ATELIER • SECURE CHECKOUT</span>
          </div>

          <h1>
            Complete <em>Your Order.</em>
          </h1>

          <p className="checkout-subheading">
            Provide your delivery details, apply coupon codes, and choose your preferred payment option. Dispatched via insured courier.
          </p>

          {/* Stepper Progress Bar */}
          <div className="checkout-stepper-bar">
            <div className="stepper-step is-completed">
              <span className="step-num">01</span>
              <span className="step-title">Customer</span>
            </div>
            <div className="stepper-divider" />
            <div className="stepper-step is-active">
              <span className="step-num">02</span>
              <span className="step-title">Address</span>
            </div>
            <div className="stepper-divider" />
            <div className="stepper-step">
              <span className="step-num">03</span>
              <span className="step-title">Payment</span>
            </div>
          </div>
        </header>

        {cart.length === 0 ? (
          <section className="checkout-empty">
            <h2>Your shopping bag is empty.</h2>
            <p>Discover our curated collections of modern luxury essentials.</p>
            <Link href="/shop" className="checkout-submit is-inline">
              <span className="checkout-btn-text">Explore Collection</span>
              <span className="checkout-btn-arrow"><ArrowRight size={16} /></span>
            </Link>
          </section>
        ) : (
          <div className="checkout-layout">
            {/* LEFT COLUMN: CONTACT & MYNTRA-STYLE ADDRESS */}
            <form className="checkout-form" onSubmit={handleOpenPayment}>
              {/* Authenticated Member Bar */}
              {currentUser && (
                <div className="checkout-member-banner">
                  <div className="member-avatar">
                    <UserCheck size={16} />
                  </div>
                  <div className="member-info">
                    <span className="member-status">VERIFIED CLIENT</span>
                    <p>
                      Signed in as <strong>{currentUser.name || currentUser.email}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* CARD 1: CONTACT DETAILS */}
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <span className="checkout-card-pill">01</span>
                  <div>
                    <h2 className="checkout-card-title">Contact Information</h2>
                    <p className="checkout-card-desc">
                      Order invoice and real-time delivery SMS updates will be sent here.
                    </p>
                  </div>
                </div>

                <div className="checkout-fields-grid">
                  <div className="checkout-fields-split">
                    <div className="checkout-field-row">
                      <label htmlFor="customerName">
                        Full Name <span className="req-dot">*</span>
                      </label>
                      <div className="checkout-input-wrap">
                        <User size={17} className="input-icon" />
                        <input
                          id="customerName"
                          name="customerName"
                          type="text"
                          autoComplete="name"
                          placeholder="Your Full Name"
                          value={form.customerName}
                          onChange={(e) =>
                            setForm({ ...form, customerName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="checkout-field-row">
                      <label htmlFor="phone">
                        Mobile Number <span className="req-dot">*</span>
                      </label>
                      <div className="checkout-input-wrap">
                        <Phone size={17} className="input-icon" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="10-digit Mobile Number"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="checkout-field-row">
                    <label htmlFor="email">
                      Email Address <span className="req-dot">*</span>
                    </label>
                    <div className="checkout-input-wrap">
                      <Mail size={17} className="input-icon" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="client@luxury.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: MYNTRA-STYLE DELIVERY DESTINATION BOX (Screenshot 2 & 3) */}
              <div className="checkout-card myntra-delivery-container">
                <div className="checkout-card-header">
                  <span className="checkout-card-pill">02</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="checkout-card-title">Delivery Address</h2>
                      {selectedAddress && (
                        <button
                          type="button"
                          className="myntra-change-btn"
                          onClick={() => setShowAddressPicker(!showAddressPicker)}
                        >
                          {showAddressPicker ? "Close List" : "Change Address"}
                        </button>
                      )}
                    </div>
                    <p className="checkout-card-desc">
                      Select delivery destination or add a new home / office address.
                    </p>
                  </div>
                </div>

                {/* If multiple saved addresses, show picker list */}
                {showAddressPicker && savedAddresses.length > 0 && (
                  <div className="myntra-saved-list-box">
                    <p className="myntra-list-heading">SAVED DELIVERY ADDRESSES</p>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`myntra-address-radio-card ${
                          selectedAddress?.id === addr.id ? "is-selected" : ""
                        }`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <input
                          type="radio"
                          name="savedAddressRadio"
                          checked={selectedAddress?.id === addr.id}
                          onChange={() => handleSelectAddress(addr)}
                        />
                        <div className="myntra-radio-content">
                          <div className="myntra-name-row">
                            <strong>{addr.full_name || addr.name}</strong>
                            <span className="myntra-type-pill">
                              {addr.addressType || "HOME"}
                            </span>
                          </div>
                          <p className="myntra-addr-snippet">
                            {addr.address_line || addr.addressLine}, {addr.city},{" "}
                            {addr.state} - {addr.postal_code || addr.pincode}
                          </p>
                          <p className="myntra-addr-mobile">
                            Mobile: <span>{addr.phone || addr.mobile}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Selected Address View (Myntra Card) */}
                {selectedAddress ? (
                  <div className="myntra-address-card">
                    <div className="myntra-card-top">
                      <div className="myntra-name-row">
                        <span className="myntra-client-name">
                          {selectedAddress.name}
                        </span>
                        <span className="myntra-type-pill">
                          {selectedAddress.addressType || "HOME"}
                        </span>
                        {selectedAddress.isDefault && (
                          <span className="myntra-default-pill">DEFAULT</span>
                        )}
                      </div>
                      <div className="myntra-action-buttons">
                        <button
                          type="button"
                          className="myntra-edit-btn"
                          onClick={() => handleOpenEditAddress(selectedAddress)}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </div>
                    </div>

                    <p className="myntra-address-text">
                      {selectedAddress.fullAddress || selectedAddress.addressLine}
                    </p>

                    <p className="myntra-mobile-text">
                      Mobile: <strong>{selectedAddress.mobile}</strong>
                    </p>

                    <div className="myntra-cod-perk">
                      <span className="myntra-bullet">•</span> Pay on Delivery available
                    </div>
                  </div>
                ) : (
                  <div className="myntra-no-address-state">
                    <MapPin size={28} className="text-amber-600 mb-2" />
                    <p className="font-semibold text-stone-800">No address selected</p>
                    <p className="text-xs text-stone-500 mb-4">
                      Please add your doorstep delivery address to continue.
                    </p>
                  </div>
                )}

                {/* Add New Address Button (Myntra Style) */}
                <button
                  type="button"
                  className="myntra-add-address-btn"
                  onClick={handleOpenAddAddress}
                >
                  <Plus size={16} /> ADD NEW ADDRESS
                </button>
              </div>

              {error && (
                <div className="checkout-error-banner" role="alert">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* ANIMATED PROCEED TO PAYMENT BUTTON */}
              <button
                type="submit"
                className="checkout-submit"
                disabled={loading || cart.length === 0}
              >
                <span className="checkout-btn-text">
                  Proceed to Payment ({formatPrice(finalPayable)})
                </span>
                <span className="checkout-btn-arrow">
                  <ArrowRight size={17} />
                </span>
              </button>

              <div className="checkout-trust-guarantee-row">
                <div className="trust-pill">
                  <Lock size={13} />
                  <span>256-Bit SSL Protection</span>
                </div>
                <div className="trust-pill">
                  <ShieldCheck size={13} />
                  <span>100% Authenticity Guarantee</span>
                </div>
                <div className="trust-pill">
                  <Truck size={13} />
                  <span>Express White-Glove Dispatch</span>
                </div>
              </div>
            </form>

            {/* RIGHT COLUMN: COUPONS, GIFTING, DONATION & ORDER SUMMARY (Screenshot 1) */}
            <aside className="checkout-summary-column">
              {/* 1. COUPONS BLOCK (Screenshot 1) */}
              <div className="myntra-coupons-card">
                <div className="myntra-block-kicker">COUPONS</div>

                {appliedCoupon ? (
                  <div className="myntra-applied-coupon-row">
                    <div className="applied-tag-icon">
                      <Tag size={18} />
                    </div>
                    <div className="applied-coupon-info">
                      <div className="flex items-center gap-2">
                        <strong className="coupon-code-badge">
                          {appliedCoupon.code}
                        </strong>
                        <span className="coupon-applied-text">APPLIED</span>
                      </div>
                      <p className="coupon-saved-text">
                        You saved {formatPrice(appliedCoupon.discount)} with this coupon!
                      </p>
                    </div>
                    <button
                      type="button"
                      className="coupon-remove-btn"
                      onClick={handleRemoveCoupon}
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <div className="myntra-coupon-cta-row">
                    <div className="flex items-start gap-3">
                      <div className="coupon-icon-circle">
                        <Tag size={16} />
                      </div>
                      <div>
                        <strong className="coupon-title-text">Apply Coupons</strong>
                        <p className="coupon-promo-sub">
                          <span className="login-gold-highlight">Special offer:</span> Get up to ₹500 OFF on your order
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="myntra-apply-btn"
                      onClick={() => setShowCouponModal(true)}
                    >
                      APPLY
                    </button>
                  </div>
                )}
              </div>

              {/* 2. GIFTING & PERSONALISATION BLOCK (Screenshot 1) */}
              <div className="myntra-gifting-card">
                <div className="myntra-block-kicker">GIFTING & PERSONALISATION</div>

                <div className="gifting-inner-banner">
                  {/* Ribbon Illustration Graphic */}
                  <div className="gifting-ribbon-wrap">
                    <div className="ribbon-vertical-band" />
                    <div className="ribbon-bow-icon">
                      <Gift size={26} />
                    </div>
                  </div>

                  <div className="gifting-text-content">
                    <h4 className="gifting-headline">Buying for a loved one?</h4>
                    <p className="gifting-desc">
                      Gift Packaging and personalised message on card, Only for ₹35
                    </p>

                    <button
                      type="button"
                      className={`gifting-action-btn ${hasGiftPackaging ? "is-added" : ""}`}
                      onClick={() => {
                        const next = !hasGiftPackaging;
                        setHasGiftPackaging(next);
                        setShowGiftDetails(next);
                        if (next) {
                          toast.success("Gift packaging added (+₹35) 🎁");
                        } else {
                          toast.info("Gift packaging removed.");
                        }
                      }}
                    >
                      {hasGiftPackaging ? "✓ GIFT PACKAGE ADDED (₹35)" : "ADD GIFT PACKAGE"}
                    </button>
                  </div>
                </div>

                {/* Optional Message Dropdown */}
                {hasGiftPackaging && (
                  <div className="gifting-message-inputs">
                    <div className="gift-input-field">
                      <label>Recipient Name</label>
                      <input
                        type="text"
                        placeholder="e.g. For Dearest Sophia"
                        value={giftDetails.recipient}
                        onChange={(e) =>
                          setGiftDetails({ ...giftDetails, recipient: e.target.value })
                        }
                      />
                    </div>
                    <div className="gift-input-field">
                      <label>Personalized Greeting Message</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Wishing you timeless elegance and happiness. With love!"
                        value={giftDetails.message}
                        onChange={(e) =>
                          setGiftDetails({ ...giftDetails, message: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SUPPORT TRANSFORMATIVE SOCIAL WORK (DONATION) (Screenshot 1) */}
              <div className="myntra-donation-card">
                <div className="myntra-block-kicker">
                  SUPPORT TRANSFORMATIVE SOCIAL WORK IN INDIA
                </div>

                <div className="donation-main-row">
                  <label className="donation-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isDonationActive}
                      onChange={(e) => {
                        setIsDonationActive(e.target.checked);
                        if (e.target.checked) {
                          toast.success(`Thank you! Added ${formatPrice(donationAmount)} contribution ❤️`);
                        }
                      }}
                    />
                    <span className="donation-title">Donate and make a difference</span>
                  </label>
                </div>

                {/* Amount Selectable Pills */}
                <div className="donation-pills-row">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`donation-amount-pill ${
                        isDonationActive && donationAmount === amt ? "is-selected" : ""
                      }`}
                      onClick={() => {
                        setDonationAmount(amt);
                        setIsDonationActive(true);
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="donation-know-more-btn"
                  onClick={() => setShowDonationModal(true)}
                >
                  Know More
                </button>
              </div>

              {/* 4. PRICE DETAILS / ORDER SUMMARY (Myntra & Luxury Combined) */}
              <div className="checkout-summary">
                <div className="summary-header-row">
                  <span className="summary-eyebrow">PRICE DETAILS</span>
                  <span className="summary-count-badge">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Cart Items Preview */}
                <div className="checkout-items-list">
                  {cart.map((item) => {
                    const itemPrice = Number(
                      String(item.price).replace(/[₹,]/g, "")
                    );
                    const itemKey =
                      item.cartItemId ||
                      (item.variantLabel
                        ? `${item.id}-${item.variantLabel}`
                        : item.id);

                    return (
                      <div className="checkout-item-luxury" key={itemKey || item.id}>
                        <div className="checkout-item-thumb">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <span>PN</span>
                          )}
                          <span className="item-qty-tag">{item.quantity}</span>
                        </div>

                        <div className="checkout-item-meta">
                          <div className="item-meta-top">
                            <span className="item-category-tag">{item.category}</span>
                            <button
                              type="button"
                              className="checkout-item-remove-btn"
                              onClick={() => setItemPendingRemoval(item)}
                              title={`Remove ${item.name} from bag`}
                              aria-label={`Remove ${item.name}`}
                            >
                              <X size={12} />
                              <span>Remove</span>
                            </button>
                          </div>

                          <h4 className="item-title" title={item.name}>{item.name}</h4>

                          {item.variantLabel && (
                            <span className="item-size-badge">Size: {item.variantLabel}</span>
                          )}

                          <div className="item-price-row">
                            <span className="item-price-val">
                              {formatPrice(itemPrice * Number(item.quantity))}
                            </span>
                            {Number(item.quantity) > 1 && (
                              <span className="item-unit-calc">
                                ({formatPrice(itemPrice)} × {item.quantity})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calculations Breakdown */}
                <div className="checkout-calc-block">
                  <div className="calc-row">
                    <span>Total MRP / Subtotal</span>
                    <span className="calc-val">{formatPrice(cartTotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="calc-row is-discount">
                      <span>
                        Coupon Discount ({appliedCoupon.code})
                      </span>
                      <span className="calc-val text-emerald-600 font-bold">
                        - {formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                  )}

                  {hasGiftPackaging && (
                    <div className="calc-row">
                      <span>Gift Packaging</span>
                      <span className="calc-val text-stone-800 font-semibold">₹35.00</span>
                    </div>
                  )}

                  {isDonationActive && (
                    <div className="calc-row">
                      <span>Social Work Contribution</span>
                      <span className="calc-val text-amber-700">
                        {formatPrice(donationAmount)}
                      </span>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Shipping Fee</span>
                    <span className="calc-free-tag">
                      <Check size={12} /> FREE
                    </span>
                  </div>

                  <div className="calc-divider" />

                  <div className="calc-total-row">
                    <div>
                      <span className="total-label">Total Amount</span>
                      <span className="total-sub">All taxes included</span>
                    </div>
                    <strong className="total-amount">{formatPrice(finalPayable)}</strong>
                  </div>
                </div>

                <div className="summary-perks-box">
                  <div className="perk-item">
                    <ShieldCheck size={16} className="perk-icon" />
                    <div>
                      <strong>Authenticity Guaranteed</strong>
                      <p>Every piece is certified and inspected prior to dispatch.</p>
                    </div>
                  </div>
                  <div className="perk-item">
                    <Truck size={16} className="perk-icon" />
                    <div>
                      <strong>Free Express Delivery</strong>
                      <p>Real-time GPS tracking and tamper-evident packaging.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* =======================================================
          MYNTRA-STYLE "ADD NEW ADDRESS" MODAL (Screenshot 2 & 3)
      ======================================================= */}
      {showAddressModal && (
        <div
          className="myntra-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddressModal(false);
          }}
        >
          <div className="myntra-modal-container" role="dialog" aria-modal="true">
            <header className="myntra-modal-header">
              <h3>{editingAddressId ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</h3>
              <button
                type="button"
                className="myntra-modal-close-btn"
                onClick={() => setShowAddressModal(false)}
                aria-label="Close address form"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSaveAddress} className="myntra-modal-body">
              {/* Contact Details */}
              <div className="myntra-input-group">
                <input
                  type="text"
                  placeholder="Name*"
                  value={addressForm.name}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="myntra-input-group">
                <input
                  type="tel"
                  placeholder="Mobile No*"
                  value={addressForm.mobile}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  required
                />
              </div>

              {/* Address Header */}
              <h4 className="myntra-form-section-title">ADDRESS</h4>

              <div className="myntra-input-group">
                <input
                  type="text"
                  placeholder="Pin Code*"
                  value={addressForm.pincode}
                  onChange={handlePincodeChange}
                  maxLength={6}
                  required
                />
              </div>

              <div className="myntra-input-group">
                <input
                  type="text"
                  placeholder="House Number/Tower/Block*"
                  value={addressForm.houseNo}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, houseNo: e.target.value })
                  }
                  required
                />
                <p className="myntra-field-helper-amber">
                  *House Number will allow a doorstep delivery
                </p>
              </div>

              <div className="myntra-input-group">
                <input
                  type="text"
                  placeholder="Address (locality,building,street)*"
                  value={addressForm.streetAddress}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      streetAddress: e.target.value,
                    })
                  }
                  required
                />
                <p className="myntra-field-helper-amber">
                  *Please update society/apartment details
                </p>
              </div>

              <div className="myntra-input-group">
                <input
                  type="text"
                  placeholder="Locality / Town*"
                  value={addressForm.locality}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, locality: e.target.value })
                  }
                />
              </div>

              {/* Split City & State */}
              <div className="myntra-split-row">
                <div className="myntra-input-group">
                  <input
                    type="text"
                    placeholder="City / District*"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="myntra-input-group">
                  <input
                    type="text"
                    placeholder="State*"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Address Type (Home / Office) */}
              <h4 className="myntra-form-section-title">ADDRESS TYPE</h4>
              <div className="myntra-radio-row">
                <label className="myntra-radio-label">
                  <input
                    type="radio"
                    name="modalAddressType"
                    value="Home"
                    checked={addressForm.addressType === "Home"}
                    onChange={() =>
                      setAddressForm({ ...addressForm, addressType: "Home" })
                    }
                  />
                  <span className="myntra-radio-text">Home</span>
                </label>

                <label className="myntra-radio-label">
                  <input
                    type="radio"
                    name="modalAddressType"
                    value="Office"
                    checked={addressForm.addressType === "Office"}
                    onChange={() =>
                      setAddressForm({ ...addressForm, addressType: "Office" })
                    }
                  />
                  <span className="myntra-radio-text">Office</span>
                </label>
              </div>

              {/* Default Address Checkbox */}
              <div className="myntra-default-checkbox-wrap">
                <label className="myntra-checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        isDefault: e.target.checked,
                      })
                    }
                  />
                  <span>Make this as my default address</span>
                </label>
              </div>

              {/* Footer Actions (Cancel / Save Buttons) */}
              <div className="myntra-modal-footer">
                <button
                  type="button"
                  className="myntra-modal-cancel-btn"
                  onClick={() => setShowAddressModal(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="myntra-modal-save-btn">
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          COUPON SELECTION & APPLY MODAL (Screenshot 1)
      ======================================================= */}
      {showCouponModal && (
        <div
          className="myntra-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCouponModal(false);
          }}
        >
          <div className="coupon-modal-container" role="dialog" aria-modal="true">
            <header className="myntra-modal-header">
              <h3>APPLY COUPON</h3>
              <button
                type="button"
                className="myntra-modal-close-btn"
                onClick={() => setShowCouponModal(false)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="coupon-modal-body">
              {/* Promo code search input */}
              <div className="coupon-input-bar">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyCoupon(couponInput);
                  }}
                />
                <button
                  type="button"
                  className="coupon-bar-apply-btn"
                  onClick={() => handleApplyCoupon(couponInput)}
                >
                  CHECK
                </button>
              </div>

              {couponError && <p className="coupon-error-msg">{couponError}</p>}

              <p className="available-coupons-label">AVAILABLE OFFERS</p>

              <div className="coupons-card-stack">
                {AVAILABLE_COUPONS.map((coupon) => (
                  <div className="available-coupon-card" key={coupon.code}>
                    <div className="coupon-card-left">
                      <div className="coupon-badge-tag">{coupon.code}</div>
                      <p className="coupon-desc-text">{coupon.description}</p>
                      <p className="coupon-min-text">
                        Minimum order: {formatPrice(coupon.minOrder)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="coupon-card-apply-btn"
                      onClick={() => handleApplyCoupon(coupon.code)}
                    >
                      APPLY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          SOCIAL WORK DONATION "KNOW MORE" MODAL
      ======================================================= */}
      {showDonationModal && (
        <div
          className="myntra-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDonationModal(false);
          }}
        >
          <div className="donation-modal-container" role="dialog" aria-modal="true">
            <header className="myntra-modal-header">
              <h3>TRANSFORMATIVE SOCIAL WORK</h3>
              <button
                type="button"
                className="myntra-modal-close-btn"
                onClick={() => setShowDonationModal(false)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="donation-modal-body">
              <div className="donation-icon-hero">
                <Heart size={36} className="text-amber-700" />
              </div>
              <h4>Empowering Artisans & Rural Weavers Across India</h4>
              <p>
                100% of your voluntary contribution directly funds livelihood training, educational stipends for craftsmen families, and eco-friendly sustainable packaging cooperatives across regional craft clusters.
              </p>
              <div className="donation-stats-row">
                <div>
                  <strong>5,000+</strong>
                  <span>Artisans Supported</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Transparent Impact</span>
                </div>
              </div>
              <button
                type="button"
                className="myntra-modal-save-btn"
                onClick={() => {
                  setIsDonationActive(true);
                  setShowDonationModal(false);
                  toast.success(`Added ${formatPrice(donationAmount)} social donation ❤️`);
                }}
              >
                Contribute {formatPrice(donationAmount)}
              </button>
            </div>
          </div>
        </div>
      )}

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
            aria-labelledby="remove-item-dialog-title"
          >
            <div className="checkout-remove-modal-header">
              <div className="checkout-remove-header-left">
                <div className="checkout-remove-icon-wrap">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 id="remove-item-dialog-title">Remove Item from Order?</h3>
                  <p className="checkout-remove-subtitle">
                    Are you sure you want to remove this item from your bag?
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
              This product will be removed from your order summary and the total payable amount will be recalculated.
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

      {/* =======================================================
          PAYMENT OPTIONS MODAL
      ======================================================= */}
      {showPaymentModal && (
        <div
          className="payment-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) {
              setShowPaymentModal(false);
            }
          }}
        >
          <div className="payment-modal-container" role="dialog" aria-modal="true">
            <button
              className="payment-modal-close"
              type="button"
              disabled={loading}
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close payment options"
            >
              <X size={18} />
            </button>

            <header className="payment-header">
              <div className="payment-eyebrow-tag">
                <Sparkles size={12} />
                <span>PRIMENEST SECURE GATEWAY</span>
              </div>
              <h2 className="payment-title">Select Payment Method</h2>
              <div className="payment-amount-badge">
                <span className="payment-amount-label">Grand Total:</span>
                <span className="payment-amount-val">{formatPrice(finalPayable)}</span>
              </div>
            </header>

            {/* 3 Payment Options: UPI, Card, Cash on Delivery */}
            <div className="payment-tabs-grid">
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === "upi" ? "active" : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                <div className="payment-tab-icon">
                  <Smartphone size={20} />
                </div>
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="payment-tab-icon">
                  <CreditCard size={20} />
                </div>
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="payment-tab-icon">
                  <Truck size={20} />
                </div>
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Payment Details Body */}
            <div className="payment-detail-card">
              {/* Option 1: UPI */}
              {paymentMethod === "upi" && (
                <div>
                  <div className="upi-brands-row">
                    <span className="upi-chip">Google Pay</span>
                    <span className="upi-chip">PhonePe</span>
                    <span className="upi-chip">Paytm</span>
                    <span className="upi-chip">BHIM UPI</span>
                  </div>

                  {!showQr ? (
                    <div className="upi-input-group">
                      <label htmlFor="upiIdInput">Enter your UPI VPA / ID</label>
                      <div className="upi-input-wrap">
                        <input
                          id="upiIdInput"
                          type="text"
                          placeholder="e.g. client@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                      <div className="upi-quick-handles">
                        {["@okhdfcbank", "@oksbi", "@paytm", "@ybl"].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            className="upi-quick-chip"
                            onClick={() => {
                              const prefix = upiId.split("@")[0] || "client";
                              setUpiId(`${prefix}${suffix}`);
                            }}
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="upi-qr-toggle"
                        onClick={() => setShowQr(true)}
                      >
                        <QrCode size={15} /> Or scan dynamic UPI QR code
                      </button>
                    </div>
                  ) : (
                    <div className="upi-qr-box">
                      <div className="qr-code-frame">
                        <svg width="130" height="130" viewBox="0 0 100 100" fill="#151515">
                          <rect x="0" y="0" width="30" height="30" fill="#151515" rx="4" />
                          <rect x="5" y="5" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="10" y="10" width="10" height="10" fill="#151515" />
                          <rect x="70" y="0" width="30" height="30" fill="#151515" rx="4" />
                          <rect x="75" y="5" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="80" y="10" width="10" height="10" fill="#151515" />
                          <rect x="0" y="70" width="30" height="30" fill="#151515" rx="4" />
                          <rect x="5" y="75" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="10" y="80" width="10" height="10" fill="#151515" />
                          <rect x="40" y="10" width="15" height="10" />
                          <rect x="45" y="25" width="15" height="15" />
                          <rect x="25" y="45" width="15" height="15" />
                          <rect x="45" y="45" width="10" height="10" />
                          <rect x="65" y="45" width="20" height="15" />
                          <rect x="45" y="70" width="15" height="20" />
                          <rect x="70" y="75" width="20" height="15" />
                        </svg>
                      </div>
                      <p className="qr-scan-label">
                        Scan with any UPI app to pay {formatPrice(finalPayable)}
                      </p>
                      <button
                        type="button"
                        className="upi-qr-toggle"
                        onClick={() => setShowQr(false)}
                      >
                        Enter UPI ID instead
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: Card with Simulated Luxury Credit Card */}
              {paymentMethod === "card" && (
                <div className="card-payment-section">
                  <div className="luxury-card-preview">
                    <div className="card-preview-top">
                      <div className="card-chip-element">
                        <div className="chip-inner-line" />
                      </div>
                      <span className="card-brand-name">PRIMENEST PRIVÉ</span>
                    </div>

                    <div className="card-preview-number">
                      {cardData.number || "•••• •••• •••• ••••"}
                    </div>

                    <div className="card-preview-bottom">
                      <div>
                        <span className="card-sub-label">CARDHOLDER</span>
                        <span className="card-sub-value">
                          {cardData.name || form.customerName || "VALUED CLIENT"}
                        </span>
                      </div>
                      <div>
                        <span className="card-sub-label">EXPIRES</span>
                        <span className="card-sub-value">{cardData.expiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-fields-grid">
                    <div className="card-field-block">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        id="cardNumber"
                        name="number"
                        type="text"
                        placeholder="4532 •••• •••• 8910"
                        value={cardData.number}
                        onChange={handleCardChange}
                        maxLength={19}
                      />
                    </div>

                    <div className="card-field-block">
                      <label htmlFor="cardName">Cardholder Name</label>
                      <input
                        id="cardName"
                        name="name"
                        type="text"
                        placeholder="Full Name as printed on card"
                        value={cardData.name}
                        onChange={handleCardChange}
                      />
                    </div>

                    <div className="card-split-row">
                      <div className="card-field-block">
                        <label htmlFor="cardExpiry">Valid Thru</label>
                        <input
                          id="cardExpiry"
                          name="expiry"
                          type="text"
                          placeholder="MM / YY"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          maxLength={5}
                        />
                      </div>
                      <div className="card-field-block">
                        <label htmlFor="cardCvv">CVV</label>
                        <input
                          id="cardCvv"
                          name="cvv"
                          type="password"
                          placeholder="•••"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 3: Cash on Delivery */}
              {paymentMethod === "cod" && (
                <div className="cod-info-box">
                  <div className="cod-badge">
                    <Truck size={20} />
                    <span>Cash / UPI on Delivery Available</span>
                  </div>
                  <p className="cod-desc">
                    You can pay safely via Cash or direct UPI scan to the courier partner upon parcel delivery.
                  </p>
                  <div className="cod-address-recap">
                    <strong>Destination:</strong>
                    <span>{form.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Security info */}
            <div className="payment-security-row">
              <ShieldCheck size={14} style={{ color: "#10b981" }} />
              <span>256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant</span>
            </div>

            {/* Confirm Payment Button with Shimmer Sweep */}
            <button
              type="button"
              className="checkout-submit"
              disabled={loading}
              onClick={handleConfirmOrder}
            >
              <span className="checkout-btn-text">
                {loading
                  ? "Securing Your Order..."
                  : paymentMethod === "cod"
                  ? "Confirm Cash on Delivery Order"
                  : `Pay ${formatPrice(finalPayable)} & Complete Order`}
              </span>
              <span className="checkout-btn-arrow">
                <ArrowRight size={17} />
              </span>
            </button>

            <button
              type="button"
              className="payment-cancel-btn"
              disabled={loading}
              onClick={() => setShowPaymentModal(false)}
            >
              ← Back to modify delivery details
            </button>
          </div>
        </div>
      )}
    </>
  );
}