
"use client";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { LogOut } from "lucide-react";

function formatDateOfBirth(value) {
  if (!value) return "Not provided";

  const [year, month, day] = String(value)
    .slice(0, 10)
    .split("-");

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

function toDisplayDob(value) {
  if (!value) return "";

  const [year, month, day] = String(value)
    .slice(0, 10)
    .split("-");

  return `${day}/${month}/${year}`;
}

export default function ProfilePage() {
  
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

const {
  wishlist,
  removeFromWishlist,
  isLoaded,
} = useWishlist(); 
const [addresses, setAddresses] = useState([]);
const [addressesLoading, setAddressesLoading] = useState(true);
const [addressError, setAddressError] = useState("");
const [showAddressForm, setShowAddressForm] = useState(false);
const [editingAddressId, setEditingAddressId] = useState(null);
const [addressSaving, setAddressSaving] = useState(false);

const [addressForm, setAddressForm] = useState({
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
});
  
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("personal");

  // All React hooks must be at the top level.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [saving, setSaving] = useState(false);

  // Load customer profile
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const text = await response.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Profile API returned an empty or invalid response. Check app/api/auth/me/route.js"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        if (!data.user) {
          throw new Error("User information was not returned.");
        }

        if (isMounted) {
          setUser(data.user);
          setEditName(data.user.name || "");
          setEditPhone(data.user.phone || "");
          setEditDob(toDisplayDob(data.user.date_of_birth));
        setEditGender(data.user.gender || "");
        }
      } catch (err) {
        console.error("Profile loading error:", err);
        console.error("Error stack:", err.stack);

        if (isMounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
  function updateActiveSection() {
    const section = window.location.hash.replace("#", "");

    const validSections = [
      "personal",
      "orders",
      "addresses",
      "wishlist",
    ];

    setActiveSection(
      validSections.includes(section) ? section : "personal"
    );
  }

  updateActiveSection();
  window.addEventListener("hashchange", updateActiveSection);

  return () => {
    window.removeEventListener("hashchange", updateActiveSection);
  };
}, []);


  
// Load saved delivery addresses
useEffect(() => {
  let isMounted = true;

  async function loadAddresses() {
    try {
      const response = await fetch("/api/profile/addresses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load addresses.");
      }

      if (isMounted) {
        setAddresses(data.addresses || []);
        setAddressError("");
      }
    } catch (error) {
      if (isMounted) {
        setAddressError(error.message);
      }
    } finally {
      if (isMounted) {
        setAddressesLoading(false);
      }
    }
  }

  loadAddresses();

  return () => {
    isMounted = false;
  };
}, []);

// Update address form fields
function handleAddressChange(event) {
  const { name, value, type, checked } = event.target;

  setAddressForm((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

// Save a new delivery address
async function handleSaveAddress(event) {
  event.preventDefault();
  setAddressSaving(true);

  try {
    const response = await fetch("/api/profile/addresses", {
      method: editingAddressId ? "PATCH" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...addressForm,
        ...(editingAddressId ? { id: editingAddressId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save address.");
    }

    // Refresh the saved addresses
    const refreshed = await fetch("/api/profile/addresses", {
      credentials: "include",
      cache: "no-store",
    });

    const refreshedData = await refreshed.json();

    if (!refreshed.ok) {
      throw new Error(
        refreshedData.message || "Address saved, but refresh failed."
      );
    }

    setAddresses(refreshedData.addresses || []);
    setAddressForm({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
    setShowAddressForm(false);
    setEditingAddressId(null);
    toast.success("Address saved successfully!");
  } catch (error) {
    toast.error("Unable to save address", {
      description: error.message,
    });
  } finally {
    setAddressSaving(false);
  }
}

  // Edit an existing delivery address
function handleEditAddress(address) {
  setEditingAddressId(address.id);

  setAddressForm({
    fullName: address.full_name || "",
    phone: address.phone || "",
    addressLine: address.address_line || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postal_code || "",
    country: address.country || "India",
    isDefault: address.is_default || false,
  });

  setShowAddressForm(true);
}


 // Load logged-in user's orders
useEffect(() => {
  let isMounted = true;

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders/my", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        setOrders([]);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your orders."
        );
      }

      if (isMounted) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Orders loading error:", error);

      if (isMounted) {
        setOrdersError(error.message);
      }
    } finally {
      if (isMounted) {
        setOrdersLoading(false);
      }
    }
  }

  loadOrders();

  return () => {
    isMounted = false;
  };
}, []);



  // Enter edit mode
 function handleCancel() {
  setEditName(user?.name || "");
  setEditPhone(user?.phone || "");
  setEditDob(
    user?.date_of_birth
      ? String(user.date_of_birth).slice(0, 10)
      : ""
  );
  setEditGender(user?.gender || "");
  setIsEditing(false);
}

  // Cancel editing
  // function handleCancel() {
  //   setEditName(user?.name || "");
  //   setIsEditing(false);
  //   setEditDob(toDisplayDob(user?.date_of_birth));
  // }

  // Save profile name through the profile update API
  
async function handleSaveProfile(event) {
  event.preventDefault();

  const name = editName.trim();

  if (!name) {
    toast.error("Please enter your name.");
    return;
  }

  if (name.length > 100) {
    toast.error("Name must be 100 characters or fewer.");
    return;
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD
  let formattedDob = null;

  if (editDob.trim()) {
    const match = editDob.trim().match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (!match) {
      toast.error("Enter date as DD/MM/YYYY.");
      return;
    }

    const [, day, month, year] = match;
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    // Validate the actual calendar date
    const date = new Date(
      Date.UTC(yearNum, monthNum - 1, dayNum)
    );

    if (
      date.getUTCFullYear() !== yearNum ||
      date.getUTCMonth() !== monthNum - 1 ||
      date.getUTCDate() !== dayNum
    ) {
      toast.error("Please enter a valid date of birth.");
      return;
    }

    // Prevent future dates (India time)
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const isoDate = `${year}-${month}-${day}`;

    if (isoDate > today) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }

    formattedDob = isoDate;
  }

  setSaving(true);

  try {
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone: editPhone.trim(),
        date_of_birth: formattedDob,
        gender: editGender || null,
      }),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Invalid server response. Check the profile update API."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update your profile."
      );
    }

    if (!data.user) {
      throw new Error(
        "The server did not return the updated user."
      );
    }

    setUser((current) => ({
      ...current,
      ...data.user,
    }));

    setEditName(data.user.name || name);
    setEditPhone(data.user.phone || "");

    // Display saved date as DD/MM/YYYY
    setEditDob(
      data.user.date_of_birth
        ? String(data.user.date_of_birth)
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/")
        : ""
    );

    setEditGender(data.user.gender || "");
    setIsEditing(false);

    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error("Profile update error:", err);
    toast.error("Unable to update profile", {
      description: err.message,
    });
  } finally {
    setSaving(false);
  }
}
  // Loading screen
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pn-profile-page">
          <p>Loading your account...</p>
        </main>
      </>
    );
  }

  // Enter edit mode
function handleEdit() {
  setEditName(user?.name || "");
  setEditPhone(user?.phone || "");
  setEditDob(toDisplayDob(user?.date_of_birth));
  setEditGender(user?.gender || "");
  setIsEditing(true);
}

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  }

  // Error screen
  if (error) {
    return (
      <>
        <Navbar />
        <main className="pn-profile-page">
          <h1>Unable to load your account</h1>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />

      <main className="pn-profile-page">
        <div className="pn-profile-container">

          {/* Page heading */}
          <div className="pn-profile-heading">
            <span>PRIMENEST / MY ACCOUNT</span>
            <h1>Welcome, {user.name}.</h1>
            <p>
              Manage your account and shopping experience.
            </p>
          </div>

          <div className="pn-profile-layout">

            {/* Sidebar */}
            <aside className="pn-profile-sidebar">
              <div className="pn-profile-avatar">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <h2>{user.name}</h2>
              <p>{user.email}</p>

              <div className="pn-profile-menu">
                <a
                  href="#personal"
                  className={activeSection === "personal" ? "selected" : ""}
                  onClick={() => setActiveSection("personal")}
                >
                  My Profile
                </a>

                <a
                  href="#orders"
                  className={activeSection === "orders" ? "selected" : ""}
                  onClick={() => setActiveSection("orders")}
                >
                  My Orders
                </a>

                <a
                  href="#addresses"
                  className={activeSection === "addresses" ? "selected" : ""}
                  onClick={() => setActiveSection("addresses")}
                >
                  My Addresses
                </a>

                <a
                  href="#wishlist"
                  className={activeSection === "wishlist" ? "selected" : ""}
                  onClick={() => setActiveSection("wishlist")}
                >
                  My Wishlist
                </a>

                <button
                  type="button"
                  className="pn-profile-logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>

              <Link
                href="/shop"
                className="pn-profile-shop"
              >
                Continue Shopping ↗
              </Link>
            </aside>

            {/* Main content */}
            <section className="pn-profile-content">

              
{/* Personal information */}
<div
  id="personal"
  className="pn-profile-section"
>
  <div className="pn-profile-section-heading">
    <div>
      <span>ACCOUNT DETAILS</span>
      <h2>Personal Information</h2>
    </div>

    {!isEditing && (
      <button
        type="button"
        className="pn-profile-edit"
        onClick={handleEdit}
      >
        Edit Profile
      </button>
    )}
  </div>

  {isEditing ? (
    <form
      className="pn-profile-edit-form"
      onSubmit={handleSaveProfile}
    >
      <div className="pn-profile-details">
        <div>
          <label htmlFor="edit-name">Full Name</label>
          <input
            id="edit-name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <span>Email Address</span>
          <strong>{user.email}</strong>
          <small>Email editing is not enabled yet.</small>
        </div>

        <div>
          <label htmlFor="edit-phone">Phone Number</label>
          <input
            id="edit-phone"
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            maxLength={20}
            placeholder="Enter your phone number"
          />
        </div>

        
        <div>
          <label htmlFor="edit-dob">Date of Birth</label>
          <input
            id="edit-dob"
            type="text"
            value={editDob}
            onChange={(e) => {
              const digits = e.target.value
                .replace(/\D/g, "")
                .slice(0, 8);

              let formatted = digits;

              if (digits.length > 4) {
                formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
              } else if (digits.length > 2) {
                formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
              }

              setEditDob(formatted);
            }}
            placeholder="DD/MM/YYYY"
            maxLength={10}
            inputMode="numeric"
            autoComplete="bday"
          />
        </div>

        <div>
          <label htmlFor="edit-gender">Gender</label>
          <select
            id="edit-gender"
            value={editGender}
            onChange={(e) => setEditGender(e.target.value)}
          >
            <option value="">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="pn-profile-edit-actions">
        <button
          type="submit"
          className="pn-profile-edit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="pn-profile-cancel"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <div className="pn-profile-details">
      <div>
        <span>Full Name</span>
        <strong>{user.name}</strong>
      </div>

      <div>
        <span>Email Address</span>
        <strong>{user.email}</strong>
      </div>

      <div>
        <span>Phone Number</span>
        <strong>{user.phone || "Not provided"}</strong>
      </div>

      <div>
        <span>Date of Birth</span>
          <strong>
              {user.date_of_birth
                ? (() => {
                    const [year, month, day] = String(user.date_of_birth)
                      .slice(0, 10)
                      .split("-");

                    const months = [
                      "January", "February", "March", "April",
                      "May", "June", "July", "August",
                      "September", "October", "November", "December",
                    ];

                    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
                  })()
                : "Not provided"}
            </strong>
      </div>

      <div>
        <span>Gender</span>
        <strong>{user.gender || "Not specified"}</strong>
      </div>
    </div>
  )}
</div>

            {/* My Orders */}
              <div
                id="orders"
                className="pn-profile-section"
              >
                <span>YOUR PURCHASES</span>
                <h2>My Orders</h2>

                {ordersLoading ? (
                  <p>Loading your orders...</p>
                ) : ordersError ? (
                  <p>{ordersError}</p>
                ) : orders.length === 0 ? (
                  <p>You haven't placed any orders yet.</p>
                ) : (
                  <div className="pn-orders-list">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="pn-order-card"
                      >
                        <div className="pn-order-header">
                          <div>
                            <span>ORDER #{order.id}</span>
                            <p>
                              {new Date(
                                order.created_at
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {order.payment_method && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  padding: "3px 9px",
                                  borderRadius: "9999px",
                                  background:
                                    order.payment_method === "upi"
                                      ? "rgba(16, 185, 129, 0.12)"
                                      : order.payment_method === "card"
                                      ? "rgba(59, 130, 246, 0.12)"
                                      : "rgba(245, 158, 11, 0.12)",
                                  color:
                                    order.payment_method === "upi"
                                      ? "#10b981"
                                      : order.payment_method === "card"
                                      ? "#3b82f6"
                                      : "#f59e0b",
                                  border: `1px solid ${
                                    order.payment_method === "upi"
                                      ? "rgba(16, 185, 129, 0.25)"
                                      : order.payment_method === "card"
                                      ? "rgba(59, 130, 246, 0.25)"
                                      : "rgba(245, 158, 11, 0.25)"
                                  }`,
                                }}
                              >
                                {order.payment_method === "upi"
                                  ? "UPI"
                                  : order.payment_method === "card"
                                  ? "Card"
                                  : "Cash on Delivery"}
                              </span>
                            )}
                            <span className="pn-order-status">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        
              <div className="pn-order-products">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-${item.productId}-${index}`}
                    className="pn-order-product"
                  >
                    <div className="pn-order-product-info">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="pn-order-product-image"
                        />
                      ) : (
                        <div className="pn-order-product-placeholder">
                          No image
                        </div>
                      )}

                      <div className="pn-order-product-details">
                        <strong>{item.productName}</strong>
                        <p>Product ID: {item.productId}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>
                          Unit Price: ₹
                          {Number(item.unitPrice).toLocaleString("en-IN")}
                        </p>
                        <strong>
                          Subtotal: ₹
                          {(
                            Number(item.unitPrice) *
                            Number(item.quantity)
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

                        <div className="pn-order-footer">
                          <span>Total Amount</span>
                          <strong>
                            ₹{Number(order.total).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="pn-order-delivery">
                          <span>DELIVERY DETAILS</span>
                          <p>{order.customer_name}</p>
                          <p>{order.phone}</p>
                          <p>{order.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              
                {/* My Addresses */}
                <div
                  id="addresses"
                  className="pn-profile-section"
                >
                  <div className="pn-profile-section-heading">
                    <div>
                      <span>DELIVERY INFORMATION</span>
                      <h2>My Addresses</h2>
                    </div>

                    <button
              type="button"
              className="group inline-flex w-fit items-center gap-2.5 rounded-xl bg-[#29251f] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#29251f]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#42382b] hover:shadow-lg hover:shadow-[#29251f]/25 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#b89a65]/30"
              onClick={() => setShowAddressForm(true)}
            >
              + Add Adress
            </button>
                  </div>

                  {showAddressForm && (
                    <form
                      className="pn-profile-edit-form"
                      onSubmit={handleSaveAddress}
                    >
                      <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

                      <div className="pn-profile-details">
                        <div>
                          <label htmlFor="address-full-name">Full Name</label>
                          <input
                            id="address-full-name"
                            name="fullName"
                            type="text"
                            value={addressForm.fullName}
                            onChange={handleAddressChange}
                            maxLength={150}
                            autoComplete="name"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-phone">Phone Number</label>
                          <input
                            id="address-phone"
                            name="phone"
                            type="tel"
                            value={addressForm.phone}
                            onChange={handleAddressChange}
                            maxLength={20}
                            autoComplete="tel"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-line">House / Street / Area</label>
                          <textarea
                            id="address-line"
                            name="addressLine"
                            value={addressForm.addressLine}
                            onChange={handleAddressChange}
                            maxLength={2000}
                            autoComplete="street-address"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-city">City</label>
                          <input
                            id="address-city"
                            name="city"
                            type="text"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            maxLength={100}
                            autoComplete="address-level2"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-state">State</label>
                          <input
                            id="address-state"
                            name="state"
                            type="text"
                            value={addressForm.state}
                            onChange={handleAddressChange}
                            maxLength={100}
                            autoComplete="address-level1"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-postal">PIN Code</label>
                          <input
                            id="address-postal"
                            name="postalCode"
                            type="text"
                            value={addressForm.postalCode}
                            onChange={handleAddressChange}
                            maxLength={20}
                            autoComplete="postal-code"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="address-country">Country</label>
                          <input
                            id="address-country"
                            name="country"
                            type="text"
                            value={addressForm.country}
                            onChange={handleAddressChange}
                            maxLength={100}
                            autoComplete="country-name"
                            required
                          />
                        </div>
                      </div>

                      <label className="pn-address-default">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                        />
                        Set as default delivery address
                      </label>

                      <div className="pn-profile-edit-actions">
                        <button
                          type="submit"
                          className="pn-profile-edit"
                          disabled={addressSaving}
                        >
                          {addressSaving
                            ? "Saving..."
                            : editingAddressId
                              ? "Update Address"
                              : "Save Address"}
                        </button>

                        <button
                          type="button"
                          className="pn-profile-cancel"
                          onClick={() => setShowAddressForm(false)}
                          disabled={addressSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {addressesLoading ? (
                    <p>Loading your saved addresses...</p>
                  ) : addressError ? (
                    <p>{addressError}</p>
                  ) : addresses.length === 0 ? (
                    <div className="pn-address-empty">
                      <p>You haven't saved any delivery addresses yet.</p>
                      <p>Add an address to make your next purchase easier.</p>
                    </div>
                  ) : (
                    <div className="pn-address-list">
                      {addresses.map((address) => (
                        <article
                          key={address.id}
                          className="pn-address-card"
                        >
                          <div className="pn-address-card-header">
                            <h3>{address.full_name}</h3>

                            <div className="pn-address-actions">
                              {address.is_default && (
                                <span className="pn-address-default-badge">
                                  DEFAULT
                                </span>
                              )}

                              <button
                                type="button"
                                className="pn-address-edit"
                                onClick={() => handleEditAddress(address)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>

                          <p>{address.phone}</p>
                          <p>{address.address_line}</p>
                          <p>
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p>{address.country}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

              {/* Wishlist */}
              
{/* Wishlist */}
<div
  id="wishlist"
  className="pn-profile-section"
>
  <span>SAVED PRODUCTS</span>
  <h2>My Wishlist</h2>

  {!isLoaded ? (
    <p>Loading your wishlist...</p>
  ) : wishlist.length === 0 ? (
    <div className="pn-address-empty">
      <p>Your wishlist is currently empty.</p>
      <p>Browse the shop and tap the heart icon to save products here.</p>
      <Link href="/shop" className="pn-profile-shop">
        Explore Products ↗
      </Link>
    </div>
  ) : (
    <div className="pn-wishlist-grid">
      {wishlist.map((product) => (
        <article
          key={product.id}
          className="pn-wishlist-card"
        >
          <div className="pn-wishlist-image">
            {product.image || product.imageUrl ? (
              <img
                src={product.image || product.imageUrl}
                alt={product.name || product.title || "Wishlist product"}
              />
            ) : (
              <div className="pn-wishlist-no-image">
                No image
              </div>
            )}
          </div>

          <div className="pn-wishlist-info">
            <h3>{product.name || product.title || "Product"}</h3>
            <p>
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </p>

            <button
              type="button"
              className="pn-wishlist-remove"
              onClick={() => removeFromWishlist(product.id)}
            >
              Remove from Wishlist
            </button>
          </div>
        </article>
      ))}
    </div>
  )}
</div>

            </section>
          </div>
        </div>
      </main>
    </>
  );
}