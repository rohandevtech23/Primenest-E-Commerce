"use client";

import { useWishlist } from "@/context/WishlistContext";
import { use, useEffect, useState, useRef, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowUpRight,
  Check,
  Ruler,
  X,
  RotateCw,
  Maximize2,
  Camera,
  ShieldCheck,
  Truck,
  Lock,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  Star,
  Package,
  Share2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  Clock,
  Tag,
  Scale,
  Shirt,
  Smartphone,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import VirtualTryOnModal from "@/components/VirtualTryOnModal";
import AIReviewSummarizer from "@/components/AIReviewSummarizer";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("UK 9");
  const [selectedColor, setSelectedColor] = useState("Grey White");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedRecently, setAddedRecently] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, active: false });
  const [activeBottomTab, setActiveBottomTab] = useState("Recommended by AI");
  const [inPageQuery, setInPageQuery] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [recentlyViewedList, setRecentlyViewedList] = useState([]);

  const mainStageRef = useRef(null);
  const chatStreamRef = useRef(null);

  // Dynamic comparison options from store catalog
  const compareOptions = useMemo(
    () => [
      { name: "Puma Palermo", price: "₹6,299" },
      { name: "Nike Court Vision", price: "₹5,999" },
      { name: "Air Jordan 1 High", price: "₹9,500" },
    ],
    []
  );
  const [compareIndex, setCompareIndex] = useState(0);
  const currentCompareOption = compareOptions[compareIndex];

  // AI Stylist chat conversation inside the right column panel
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      id: "init",
      sender: "ai",
      text: "Hi! 👋 I can help you find similar shoes, suggest outfits, compare products, or answer any questions about this sneaker.",
    },
  ]);

  // Color Swatches
  const colorSwatches = [
    { name: "Grey White", hex: "#9ea4ad", ring: "#e2e8f0" },
    { name: "Off White", hex: "#eae6df", ring: "#f8fafc" },
    { name: "Ice Blue", hex: "#a8cde5", ring: "#bae6fd" },
    { name: "Pink", hex: "#efa9ba", ring: "#fbcfe8" },
  ];

  // Fetch product from PostgreSQL API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectedImageIndex(0);
        setQuantity(1);

        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found"
              : "Unable to load product"
          );
        }

        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);

        // Default to UK 9 if available, else first variant
        if (Array.isArray(data.product?.variants) && data.product.variants.length > 0) {
          const hasUK9 = data.product.variants.some(
            (v) => (v.label || v) === "UK 9"
          );
          setSelectedVariant(hasUK9 ? "UK 9" : data.product.variants[0].label || data.product.variants[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (!product || !product.id) return;
    try {
      const raw = localStorage.getItem("primenest_recently_viewed");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((p) => String(p.id) !== String(product.id));
      list.unshift({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 7600,
        rating: 4.8,
        image: product.image || "https://i.pinimg.com/736x/09/b9/dd/09b9dd42e8bb0fddd551ae5bbba36cbf.jpg",
        category: product.category || "Footwear",
        badge: "Recently Viewed",
      });
      list = list.slice(0, 10);
      localStorage.setItem("primenest_recently_viewed", JSON.stringify(list));
      setRecentlyViewedList(list);
    } catch (err) {
      console.error("Recently viewed save error:", err);
    }
  }, [product]);

  // Auto-scroll chat internally on new message (never scroll outer window)
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTo({
        top: chatStreamRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [aiChatMessages, aiTyping]);

  // Scroll listener for sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 560);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Category detection
  const isFootwear =
    product?.category === "Footwear" ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("shoes")) ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("sneaker")) ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("footwear"));

  // Default fallback variants
  const defaultShoeSizes = [
    { label: "UK 6", stock: 12 },
    { label: "UK 7", stock: 15 },
    { label: "UK 8", stock: 18 },
    { label: "UK 9", stock: 16 },
    { label: "UK 10", stock: 10 },
    { label: "UK 11", stock: 8 },
  ];

  const rawVariants =
    Array.isArray(product?.variants) && product.variants.length > 0
      ? product.variants
      : isFootwear
      ? defaultShoeSizes
      : [];

  const variants = rawVariants
    .map((variant) =>
      typeof variant === "string"
        ? { label: variant, stock: null }
        : {
            ...variant,
            label: variant.label ?? variant.name ?? variant.value ?? "",
            stock: variant.stock == null ? null : Number(variant.stock),
          }
    )
    .filter((variant) => variant.label);

  const hasVariants = variants.length > 0;

  const activeVariant = variants.find(
    (variant) => variant.label === selectedVariant
  );

  const availableStock =
    activeVariant?.stock != null && Number.isFinite(activeVariant.stock)
      ? Math.max(0, activeVariant.stock)
      : Math.max(0, Number(product?.stock) || 49);

  const isOutOfStock = availableStock < 1;

  // Build a rich 6-image gallery matching the screenshot
  const fallbackGallery = [
    product?.image || "https://i.pinimg.com/736x/09/b9/dd/09b9dd42e8bb0fddd551ae5bbba36cbf.jpg",
    "https://i.pinimg.com/736x/9b/29/97/9b29978c7b3a5fa521f50262ab031f7c.jpg",
    "https://i.pinimg.com/1200x/56/e2/ea/56e2ea9c50d29730199302ab68ca47be.jpg",
    "https://i.pinimg.com/1200x/5b/78/5c/5b785ca9637cfa7e45195b7ef86a8fe9.jpg",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80",
  ];

  const images =
    Array.isArray(product?.images) && product.images.length >= 3
      ? product.images
      : fallbackGallery;

  const currentImage = images[selectedImageIndex] || images[0] || "";

  // 360° interactive rotation timer
  useEffect(() => {
    let timer;
    if (is360Active && images.length > 1) {
      timer = setInterval(() => {
        setSelectedImageIndex((curr) => (curr + 1) % images.length);
      }, 700);
    }
    return () => clearInterval(timer);
  }, [is360Active, images.length]);

  const prevImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((curr) =>
      curr === 0 ? images.length - 1 : curr - 1
    );
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((curr) =>
      curr === images.length - 1 ? 0 : curr + 1
    );
  };

  // Mouse hover zoom handlers
  const handleMouseMove = (e) => {
    if (!mainStageRef.current) return;
    const rect = mainStageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, active: false }));
  };

  // Cart operations
  const handleAddToCart = () => {
    if (hasVariants && !activeVariant) {
      toast.error("Please select your shoe size before adding to bag.");
      return;
    }
    if (quantity < 1 || quantity > availableStock) return;

    const cartProduct = {
      ...product,
      selectedVariant: activeVariant || { label: selectedVariant },
      variantLabel: selectedVariant,
      color: selectedColor,
    };

    addToCart(cartProduct, quantity);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 2400);
  };

  const handleBuyNow = () => {
    if (hasVariants && !activeVariant) {
      toast.error("Please select your shoe size to proceed.");
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  // =========================================================================
  // COMPLETE THE LOOK (OUTFIT DIALOG MODAL STATE & HANDLERS)
  // =========================================================================
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [outfitSizes, setOutfitSizes] = useState({
    shoe: selectedVariant || "UK 9",
    jeans: "32",
    tee: "L",
  });
  const [outfitSelectedItems, setOutfitSelectedItems] = useState({
    shoe: true,
    jeans: true,
    tee: true,
  });

  // Keep shoe size in sync with page selectedVariant
  useEffect(() => {
    if (selectedVariant) {
      setOutfitSizes((prev) => ({ ...prev, shoe: selectedVariant }));
    }
  }, [selectedVariant]);

  // Handle ESC key and scroll lock for outfit modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOutfitModalOpen(false);
      }
    };
    if (isOutfitModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOutfitModalOpen]);

  // Complete outfit pieces definition
  const outfitPieces = useMemo(() => {
    const shoeSizes =
      Array.isArray(product?.variants) && product.variants.length > 0
        ? product.variants.map((v) =>
            typeof v === "object" ? v.label || v.size || v.name : String(v)
          )
        : ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

    return [
      {
        key: "shoe",
        id: product?.id || 101,
        name: product?.name || "Air Jordan 1 Low Retro",
        category: "Footwear",
        tag: "Core Sneaker",
        price: Number(product?.price) || 7600,
        image:
          currentImage ||
          product?.images?.[0] ||
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
        sizes: shoeSizes,
        sizeType: "Shoe Size (UK)",
        desc: "Heritage low-top silhouette with responsive Nike Air heel cushioning",
      },
      {
        key: "jeans",
        id: 991,
        name: "Vintage Washed Indigo Denim Jeans",
        category: "Denim & Bottoms",
        tag: "Relaxed Straight",
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80",
        sizes: ["28", "30", "32", "34", "36", "38"],
        sizeType: "Waist Size",
        desc: "13.5oz ring-spun raw denim with authentic distressed vintage wash",
      },
      {
        key: "tee",
        id: 992,
        name: "Heavyweight Boxy Tee & Snapback Cap Set",
        category: "Streetwear Apparel",
        tag: "Oversized Fit",
        price: 1899,
        image:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80",
        sizes: ["S", "M", "L", "XL", "XXL"],
        sizeType: "Apparel Size",
        desc: "240 GSM drop-shoulder boxy cotton tee paired with structured 6-panel cap",
      },
    ];
  }, [product, currentImage]);

  // Pricing calculations with 10% Bundle Discount
  const outfitPricing = useMemo(() => {
    const selectedList = outfitPieces.filter((p) => outfitSelectedItems[p.key]);
    const originalTotal = selectedList.reduce((sum, item) => sum + item.price, 0);
    const isFullBundle =
      outfitSelectedItems.shoe && outfitSelectedItems.jeans && outfitSelectedItems.tee;
    const discountAmount = isFullBundle ? Math.round(originalTotal * 0.1) : 0;
    const finalTotal = Math.max(0, originalTotal - discountAmount);

    return {
      selectedCount: selectedList.length,
      originalTotal,
      discountAmount,
      finalTotal,
      isFullBundle,
    };
  }, [outfitPieces, outfitSelectedItems]);

  // Add Outfit pieces to Cart with selected sizes
  const handleConfirmOutfitCart = ({ checkout = false } = {}) => {
    const selectedPieces = outfitPieces.filter((p) => outfitSelectedItems[p.key]);
    if (selectedPieces.length === 0) {
      toast.error("Please select at least one item from the outfit.");
      return;
    }

    selectedPieces.forEach((piece) => {
      const chosenSize = outfitSizes[piece.key];
      if (piece.key === "shoe") {
        addToCart(
          {
            ...product,
            selectedVariant: { label: chosenSize },
            variantLabel: chosenSize,
            color: selectedColor,
          },
          1,
          { silent: true }
        );
      } else {
        addToCart(
          {
            id: piece.id,
            name: piece.name,
            price: piece.price,
            image: piece.image,
            category: piece.category,
            variantLabel: `${piece.sizeType}: ${chosenSize}`,
            selectedVariant: { label: chosenSize },
          },
          1,
          { silent: true }
        );
      }
    });

    setIsOutfitModalOpen(false);

    if (checkout) {
      toast.success("Outfit configured! Proceeding to checkout ⚡", {
        description: `${selectedPieces.length} item${
          selectedPieces.length > 1 ? "s" : ""
        } added with custom sizes.`,
      });
      router.push("/checkout");
    } else {
      toast.success(
        selectedPieces.length === 3
          ? "Complete 3-Piece Outfit added to Bag! 🛍️"
          : `${selectedPieces.length} Outfit item${
              selectedPieces.length > 1 ? "s" : ""
            } added to Bag! 🛍️`,
        {
          description: `Total: ₹${outfitPricing.finalTotal.toLocaleString(
            "en-IN"
          )}${
            outfitPricing.discountAmount > 0
              ? ` (Saved ₹${outfitPricing.discountAmount.toLocaleString("en-IN")})`
              : ""
          }`,
        }
      );
    }
  };

  const handleOpenOutfitModal = () => {
    setIsOutfitModalOpen(true);
  };

  // Share functionality
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard! 📋");
    } else {
      toast.success("Link ready to share!");
    }
  };

  // =========================================================================
  // CATALOG DATA FOR EACH TAB
  // =========================================================================
  const aiRecommendedProducts = [
    {
      id: 104,
      name: "Nike Dunk Low",
      price: 8499,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
      category: "Footwear",
      badge: "98% AI Match",
    },
    {
      id: 105,
      name: "Puma Palermo Sneakers",
      price: 6299,
      rating: 4.5,
      image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/402692/02/sv01/fnd/IND/fmt/png/Palermo-Leather-Sneakers",
      category: "Footwear",
      badge: "96% AI Match",
    },
    {
      id: 106,
      name: "Adidas Campus 00s",
      price: 7999,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
      category: "Footwear",
      badge: "95% AI Match",
    },
    {
      id: 101,
      name: "Air Jordan 1 Mid",
      price: 9999,
      rating: 4.8,
      image: "https://i.pinimg.com/1200x/39/0e/d7/390ed756a6c663cd8f55457165cc7bf5.jpg",
      category: "Footwear",
      badge: "97% AI Match",
    },
    {
      id: 107,
      name: "Nike Court Vision Low",
      price: 5999,
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
      category: "Footwear",
      badge: "93% AI Match",
    },
    {
      id: 108,
      name: "Puma CA Pro",
      price: 6499,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
      category: "Footwear",
      badge: "94% AI Match",
    },
  ];

  const similarSneakerProducts = useMemo(() => {
    const defaultSimilar = [
      {
        id: 104,
        name: "Travis Scott x AJ1 Low",
        price: 8200,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80",
        category: "Footwear",
        badge: "Similar Silhouette",
      },
      {
        id: 101,
        name: "Air Jordan 1 High OG",
        price: 9500,
        rating: 4.9,
        image: "https://i.pinimg.com/1200x/39/0e/d7/390ed756a6c663cd8f55457165cc7bf5.jpg",
        category: "Footwear",
        badge: "Jordan Heritage",
      },
      {
        id: 103,
        name: "Air Jordan 3 Retro",
        price: 12500,
        rating: 4.8,
        image: "https://i.pinimg.com/736x/ac/dd/4a/acdd4adacb1d82d89ead17aaf03020e9.jpg",
        category: "Footwear",
        badge: "Classic Air",
      },
      {
        id: 107,
        name: "Nike Court Vision Low",
        price: 5999,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
        category: "Footwear",
        badge: "Cheaper Option",
      },
      {
        id: 105,
        name: "Puma Palermo Leather",
        price: 6299,
        rating: 4.5,
        image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/402692/02/sv01/fnd/IND/fmt/png/Palermo-Leather-Sneakers",
        category: "Footwear",
        badge: "Similar Low-Top",
      },
      {
        id: 115,
        name: "Batman: Dark Knight 3.0",
        price: 15699,
        rating: 4.7,
        image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1787831692_8900888.jpg?w=480&dpr=2",
        category: "Footwear",
        badge: "Limited Edition",
      },
    ];

    if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
      const dbMapped = relatedProducts.map((p) => {
        let cleanName = p.name || "Sneaker";
        if (cleanName.toLowerCase().includes("travis scott")) {
          cleanName = "Travis Scott x AJ1 Low";
        } else if (cleanName.length > 25) {
          cleanName = cleanName.slice(0, 24) + "...";
        }

        let cleanImage = p.image || p.image_url;
        if (!cleanImage || cleanImage.includes("sneakernews.com")) {
          cleanImage = "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80";
        }

        return {
          id: p.id,
          name: cleanName,
          price: Number(p.price) || 8200,
          rating: 4.8,
          image: cleanImage,
          category: p.category || "Footwear",
          badge: "Similar Silhouette",
        };
      });
      const extra = defaultSimilar.filter(
        (s) => !dbMapped.some((d) => String(d.id) === String(s.id))
      );
      return [...dbMapped, ...extra].slice(0, 6);
    }
    return defaultSimilar;
  }, [relatedProducts]);

  const youMayAlsoLikeProducts = [
    {
      id: 991,
      name: "Vintage Washed Indigo Denim Jeans",
      price: 2499,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      category: "Men",
      badge: "Denim Pairing",
    },
    {
      id: 992,
      name: "Heavyweight Boxy Tee & Snapback Cap Set",
      price: 1899,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
      category: "Men",
      badge: "Complete Look",
    },
    {
      id: 993,
      name: "Atelier French Terry Oversized Hoodie",
      price: 3499,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
      category: "Men",
      badge: "Streetwear",
    },
    {
      id: 994,
      name: "Minimalist Relaxed Utility Cargo Pants",
      price: 2999,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      category: "Men",
      badge: "Trending",
    },
    {
      id: 995,
      name: "PrimeNest Extrait de Parfum (100ml)",
      price: 4200,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
      category: "Perfume",
      badge: "Luxury Fragrance",
    },
    {
      id: 996,
      name: "Jordan Heritage Flight Bomber Jacket",
      price: 6800,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      category: "Men",
      badge: "Flight Collection",
    },
  ];

  // Dynamic active tab product retriever
  const currentTabProducts = useMemo(() => {
    switch (activeBottomTab) {
      case "Similar Products":
        return similarSneakerProducts;
      case "You May Also Like":
        return youMayAlsoLikeProducts;
      case "Recently Viewed":
        return recentlyViewedList.length > 0 ? recentlyViewedList : similarSneakerProducts;
      case "Recommended by AI":
      default:
        return aiRecommendedProducts;
    }
  }, [activeBottomTab, similarSneakerProducts, recentlyViewedList]);

  // =========================================================================
  // AI STYLIST CHAT LOGIC (RESPONSIVE CHIPS & REAL AI REPLIES)
  // =========================================================================
  const handleSendChatMessage = async (queryText) => {
    const q = (queryText || inPageQuery || "").trim();
    if (!q) return;

    const userMsg = { id: `u-${Date.now()}`, sender: "user", text: q };
    setAiChatMessages((prev) => [...prev, userMsg]);
    setInPageQuery("");
    setAiTyping(true);

    const lower = q.toLowerCase();

    // 1. Similar sneakers query
    if (lower.includes("similar") || lower.includes("alternative")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `Here are the top 3 similar sneakers for ${product?.name || "Air Jordan 1 Low"} based on silhouette, leather craftsmanship & street presence:`,
            products: [
              {
                id: 104,
                name: "Nike Dunk Low",
                price: "₹8,499",
                image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
              },
              {
                id: 105,
                name: "Puma Palermo",
                price: "₹6,299",
                image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/402692/02/sv01/fnd/IND/fmt/png/Palermo-Leather-Sneakers",
              },
              {
                id: 106,
                name: "Adidas Campus 00s",
                price: "₹7,999",
                image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80",
              },
            ],
            action: "view_similar_tab",
          },
        ]);
        setAiTyping(false);

        // Switch bottom tab to 'Similar Products' in background without moving page
        setActiveBottomTab("Similar Products");
      }, 550);
      return;
    }

    // 2. Jeans query
    if (lower.includes("jean") || lower.includes("denim") || lower.includes("pant")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `✨ Denim Styling Guide for ${product?.name || "Air Jordan 1 Low"}:\n\n• Slim / Straight Dark Indigo: Clean, tailored, elevated look.\n• Washed Black Denim: High-contrast urban street aesthetic.\n• Relaxed Cargo Denim: On-trend 90s relaxed silhouette.`,
          },
        ]);
        setAiTyping(false);
      }, 550);
      return;
    }

    // 3. Cheaper options query
    if (lower.includes("cheap") || lower.includes("budget") || lower.includes("price") || lower.includes("under")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `Here are great budget-friendly alternatives with the identical low-profile court silhouette:`,
            products: [
              {
                id: 107,
                name: "Nike Court Vision Low",
                price: "₹5,999",
                image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80",
              },
              {
                id: 105,
                name: "Puma Palermo Sneakers",
                price: "₹6,299",
                image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/402692/02/sv01/fnd/IND/fmt/png/Palermo-Leather-Sneakers",
              },
            ],
            action: "view_similar_tab",
          },
        ]);
        setAiTyping(false);
        setActiveBottomTab("Similar Products");
      }, 550);
      return;
    }

    // 4. Compare with alternative products query
    if (
      lower.includes("compare") ||
      lower.includes("vs") ||
      lower.includes("palermo") ||
      lower.includes("puma") ||
      lower.includes("court") ||
      lower.includes("vision") ||
      lower.includes("high") ||
      lower.includes("dunk")
    ) {
      let title = "";
      let details = "";

      if (
        lower.includes("palermo") ||
        lower.includes("puma") ||
        (lower.includes("compare") && currentCompareOption.name.includes("Palermo"))
      ) {
        title = `⚖️ ${product?.name || "Air Jordan 1 Low"} vs Puma Palermo Leather:`;
        details = `• Vibe & Heritage: AJ1 Low delivers 1985 basketball court DNA; Puma Palermo brings 1980s Italian terrace football culture with a gum sole.\n• Upper Materials: AJ1 Low has smooth stitched leather; Palermo combines soft suede overlays with a signature T-toe design.\n• Cushioning: AJ1 features encapsulated Nike Air-Sole in the heel; Palermo uses a low-profile street EVA cupsole.\n• Price & Savings: AJ1 Low is ₹7,600 vs Puma Palermo at ₹6,299 (Puma saves you ₹1,301).`;
      } else if (
        lower.includes("court") ||
        lower.includes("vision") ||
        (lower.includes("compare") && currentCompareOption.name.includes("Court Vision"))
      ) {
        title = `⚖️ ${product?.name || "Air Jordan 1 Low"} vs Nike Court Vision Low:`;
        details = `• Aesthetic: Near-identical 1980s low-top court look with clean Swoosh placement.\n• Materials: AJ1 uses premium full-grain leather; Court Vision uses durable synthetic eco-leather.\n• Sole & Comfort: AJ1 has encapsulated Air in the heel; Court Vision uses a standard durable rubber cupsole.\n• Price & Savings: AJ1 Low (₹7,600) vs Court Vision (₹5,999) — Court Vision gives you the iconic look while saving ₹1,601!`;
      } else if (
        lower.includes("high") ||
        (lower.includes("compare") && currentCompareOption.name.includes("High"))
      ) {
        title = `⚖️ ${product?.name || "Air Jordan 1 Low"} vs Air Jordan 1 High OG:`;
        details = `• Collar Profile: AJ1 Low offers full ankle mobility for everyday rotation; AJ1 High has the iconic 9-hole padded collar with Wings emblem.\n• Styling: Lows are effortless with shorts, cropped trousers, and warm-weather fits; Highs look best with loose/baggy streetwear denim.\n• Price: AJ1 Low is ₹7,600 vs AJ1 High at ₹9,500.`;
      } else {
        title = `⚖️ ${product?.name || "Air Jordan 1 Low"} vs Nike Dunk Low:`;
        details = `• Cushioning: AJ1 Low features encapsulated Nike Air-Sole heel cushioning; Dunk Low uses standard EVA foam.\n• Fit & Toe Box: AJ1 Low has a sleeker tapered toe profile; Dunk Low has a wider skate cupsole.\n• Heritage: AJ1 was Michael Jordan's 1985 signature sneaker; Dunk was built for 1985 college basketball.`;
      }

      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `${title}\n\n${details}`,
          },
        ]);
        setAiTyping(false);
      }, 550);
      return;
    }

    // 5. Daily use query
    if (lower.includes("daily") || lower.includes("workout") || lower.includes("gym") || lower.includes("college")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `Yes! The ${product?.name || "Air Jordan 1 Low"} is engineered with lightweight foam and encapsulated Nike Air cushioning, making it exceptionally comfortable and durable for daily casual rotation and street wear.`,
          },
        ]);
        setAiTyping(false);
      }, 550);
      return;
    }

    // 6. Generic / Custom Query -> Call real /api/ai/chat API
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${q} (Current Product: ${product?.name}, Price: ₹${product?.price}, Category: ${product?.category})`,
          history: aiChatMessages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply || `The ${product?.name || "Air Jordan 1 Low"} is rated 4.8/5 by 234 verified buyers with a 98% fit confidence.`,
            products: Array.isArray(data.products) && data.products.length > 0 ? data.products.slice(0, 3) : null,
          },
        ]);
      } else {
        throw new Error("AI Stylist API error");
      }
    } catch {
      setAiChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `The ${product?.name || "Air Jordan 1 Low"} features premium leather and responsive cushioning. Available in UK sizes 6-11 with a 98% fit confidence. Would you like me to select UK 9 for you?`,
        },
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="dark-obsidian-root">
        <Navbar />
        <main className="dark-loading-container">
          <div className="dark-spinner-ring" />
          <p>Loading PrimeNest luxury showcase...</p>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="dark-obsidian-root">
        <Navbar />
        <main className="dark-error-container">
          <p className="dark-error-brand">PRIMENEST / ARCHIVE</p>
          <h1>{error || "Product not found"}</h1>
          <Link href="/shop" className="dark-return-btn">
            Return to shop ↗
          </Link>
        </main>
      </div>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => String(item.id) === String(product.id)
  );

  return (
    <div className="dark-obsidian-root">
      <Navbar />

      <main className="dark-product-main">
        {/* =========================================================================
            1. BREADCRUMBS
           ========================================================================= */}
        <nav className="dark-breadcrumb-bar" aria-label="Breadcrumb">
          <Link href="/" className="dark-crumb-link">Home</Link>
          <span className="dark-crumb-arrow">&gt;</span>
          <Link href="/shop" className="dark-crumb-link">Shop</Link>
          <span className="dark-crumb-arrow">&gt;</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category || "Footwear")}`}
            className="dark-crumb-link"
          >
            {product.category || "Footwear"}
          </Link>
          <span className="dark-crumb-arrow">&gt;</span>
          <span className="dark-crumb-active">
            {product.subcategory || "Men's Sneakers"}
          </span>
        </nav>

        {/* =========================================================================
            2. TOP 3-COLUMN SHOWCASE LAYOUT (Exact to screenshot)
           ========================================================================= */}
        <section className="dark-showcase-grid">
          {/* -----------------------------------------------------------------------
              COLUMN 1: Left Gallery (Vertical Thumbnails + Main Image Stage)
             ----------------------------------------------------------------------- */}
          <div className="dark-gallery-complex">
            {/* Vertical Thumbnail Strip */}
            <div className="dark-thumb-strip" role="tablist">
              {images.slice(0, 5).map((imgUrl, idx) => {
                const isActive = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`dark-thumb-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setIs360Active(false);
                      setSelectedImageIndex(idx);
                    }}
                  >
                    <img src={imgUrl} alt={`Angle ${idx + 1}`} loading="lazy" />
                  </button>
                );
              })}

              {images.length > 5 && (
                <button
                  type="button"
                  className="dark-thumb-btn dark-thumb-viewall"
                  onClick={() => setIsFullscreenOpen(true)}
                  title="View all photos"
                >
                  <span className="viewall-count">+{images.length - 4}</span>
                  <span className="viewall-text">View All</span>
                </button>
              )}
            </div>

            {/* Large Main Product Image Stage */}
            <div className="dark-main-stage-card">
              {/* Vertical Watermark */}
              <div className="dark-stage-watermark">
                {product.name ? product.name.toUpperCase() : "AIR JORDAN 1 LOW"}
              </div>

              {/* Top-Right Floating Glass Action Pills */}
              <div className="dark-stage-pills">
                <button
                  type="button"
                  className={`dark-stage-pill ${is360Active ? "active" : ""}`}
                  onClick={() => setIs360Active(!is360Active)}
                  title="360° Interactive Rotation"
                >
                  <RotateCw size={13} className={is360Active ? "spin-360" : ""} />
                  <span>360°</span>
                </button>

                <button
                  type="button"
                  className="dark-stage-pill"
                  onClick={() => setIsTryOnOpen(true)}
                  title="Virtual On-Foot Try On with AI"
                >
                  <Camera size={13} />
                  <span>AR Try On</span>
                </button>

                <button
                  type="button"
                  className="dark-stage-pill"
                  onClick={handleShare}
                  title="Share product link"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  className="dark-stage-pill dark-stage-pill-icononly"
                  onClick={() => setIsFullscreenOpen(true)}
                  title="Fullscreen zoom"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Atmospheric Background & Stone Pedestal Stage */}
              <div className="dark-stage-silhouette" />
              <div className="dark-stage-pedestal" />
              <div className="dark-stage-spotlight" />

              {/* Main Shoe Image with Mouse Zoom */}
              <div
                ref={mainStageRef}
                className="dark-stage-image-wrap"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="dark-zoom-lens"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: zoomPos.active ? "scale(1.65)" : "scale(1)",
                  }}
                >
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="dark-hero-shoe-img"
                  />
                </div>

                <div className="dark-shoe-contact-shadow" />
              </div>

              {/* Bottom Pagination Badge (< 01 / 06 >) */}
              <div className="dark-stage-pagination">
                <button
                  type="button"
                  className="stage-page-arrow"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="stage-page-numbers">
                  {String(selectedImageIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  className="stage-page-arrow"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              COLUMN 2: Center Product Details & Purchase Form
             ----------------------------------------------------------------------- */}
          <div className="dark-product-info-col">
            {/* Brand Eyebrow */}
            <div className="dark-brand-row">
              <span className="dark-brand-symbol">❖</span>
              <span className="dark-brand-name">JORDAN</span>
            </div>

            {/* Product Title */}
            <h1 className="dark-product-title">{product.name}</h1>

            {/* Ratings & #1 Best Seller Tag */}
            <div className="dark-rating-bestseller-row">
              <div className="dark-stars-wrap">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className="dark-rating-text">4.8 (234 Reviews)</span>
              <span className="dark-bestseller-badge">#1 Best Seller</span>
            </div>

            {/* Price Block */}
            <div className="dark-price-container">
              <div className="dark-price-value">{formatPrice(product.price)}</div>
              <div className="dark-price-sub">Inclusive of all taxes</div>
            </div>

            {/* Product Short Description */}
            <p className="dark-product-desc">
              {product.description ||
                "Inspired by the original Air Jordan 1, this sneaker combines timeless style, premium craftsmanship, and lightweight comfort for a versatile look that pairs effortlessly with any outfit."}
            </p>

            {/* Color Swatches */}
            <div className="dark-color-section">
              <div className="dark-section-label">
                Color: <strong>{selectedColor}</strong>
              </div>
              <div className="dark-color-swatches">
                {colorSwatches.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      className={`dark-color-swatch-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={`Select ${c.name}`}
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: isSelected ? `0 0 0 2px #0f121a, 0 0 0 4px ${c.ring}` : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Section */}
            <div className="dark-size-section">
              <div className="dark-size-header">
                <span className="dark-section-label">Size (UK/IN)</span>
                <button
                  type="button"
                  className="dark-size-guide-link"
                  onClick={() => setShowSizeGuide(true)}
                >
                  <Ruler size={13} />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="dark-size-chips-grid">
                {variants.map((v) => {
                  const isSelected = selectedVariant === v.label;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      className={`dark-size-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedVariant(v.label)}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ✨ AI Size Recommendation Card (Emerald Card matching screenshot) */}
            <div
              className="dark-ai-size-card"
              onClick={() => {
                setSelectedVariant("UK 9");
                toast.success("AI Recommendation: UK 9 auto-selected with 98% Fit Confidence ✨");
              }}
              title="Click to auto-select recommended size"
            >
              <div className="ai-size-left-icon">
                <Smartphone size={16} />
              </div>
              <div className="ai-size-mid-text">
                <div className="ai-size-title-row">
                  <span className="ai-size-title">AI Size Recommendation</span>
                  <span className="ai-size-recommended-pill">Recommended</span>
                </div>
                <div className="ai-size-sub">
                  Based on your previous orders and similar customers.
                </div>
              </div>
              <div className="ai-size-right-col">
                <div className="ai-size-pick-label">UK 9 &gt;</div>
                <div className="ai-size-pick-conf">98% Fit Confidence</div>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="dark-action-buttons-row">
              <button
                type="button"
                className="dark-btn-addtobag"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag size={17} />
                <span>{addedRecently ? "Added to Bag!" : "Add to Bag"}</span>
              </button>

              <button
                type="button"
                className="dark-btn-buynow"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <Zap size={17} fill="#0b0e14" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="dark-trust-row">
              <div className="dark-trust-item">
                <RefreshCw size={13} />
                <span>7-Day Return</span>
              </div>
              <div className="dark-trust-item">
                <Truck size={13} />
                <span>Free Delivery</span>
              </div>
              <div className="dark-trust-item">
                <ShieldCheck size={13} />
                <span>100% Authentic</span>
              </div>
              <div className="dark-trust-item">
                <Lock size={13} />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              COLUMN 3: PrimeNest AI Stylist (Glowing Purple ChatGPT Panel)
             ----------------------------------------------------------------------- */}
          <div className="dark-ai-stylist-panel">
            {/* Stylist Header */}
            <div className="ai-stylist-header">
              <div className="ai-stylist-icon-badge">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="ai-stylist-title">PrimeNest AI Stylist</h3>
                <p className="ai-stylist-sub">Your personal shopping assistant</p>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="ai-stylist-chat-stream" ref={chatStreamRef}>
              {aiChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`ai-stylist-bubble ${
                    msg.sender === "user" ? "user-bubble" : "ai-bubble"
                  }`}
                >
                  <div className="ai-bubble-text">{msg.text}</div>

                  {/* Embedded product recommendations inside AI reply */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="ai-chat-products-row">
                      {msg.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.id}`}
                          className="ai-mini-product-card"
                        >
                          <img src={p.image} alt={p.name} className="ai-mini-thumb" />
                          <div className="ai-mini-details">
                            <span className="ai-mini-name">{p.name}</span>
                            <span className="ai-mini-price">{p.price}</span>
                          </div>
                          <span className="ai-mini-view-btn">View ↗</span>
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              ))}

              {aiTyping && (
                <div className="ai-stylist-bubble ai-bubble ai-typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
            </div>

            {/* 5 Quick Prompt Chips */}
            <div className="ai-stylist-chips-stack">
              <button
                type="button"
                className="ai-stylist-chip"
                onClick={() => handleSendChatMessage("Is this good for daily use?")}
              >
                <Clock size={12} />
                <span>Is this good for daily use?</span>
              </button>

              <button
                type="button"
                className="ai-stylist-chip"
                onClick={() => handleSendChatMessage("Show similar sneakers")}
              >
                <Sparkles size={12} />
                <span>Show similar sneakers</span>
              </button>

              <button
                type="button"
                className="ai-stylist-chip"
                onClick={() => handleSendChatMessage("Can I wear this with jeans?")}
              >
                <Shirt size={12} />
                <span>Can I wear this with jeans?</span>
              </button>

              <button
                type="button"
                className="ai-stylist-chip"
                onClick={() => handleSendChatMessage("Show cheaper options")}
              >
                <Tag size={12} />
                <span>Show cheaper options</span>
              </button>

              <div className="ai-stylist-chip-compare-row">
                <button
                  type="button"
                  className="ai-stylist-chip"
                  onClick={() => handleSendChatMessage(`Compare with ${currentCompareOption.name}`)}
                  title={`Compare ${product?.name || "AJ1"} with ${currentCompareOption.name}`}
                >
                  <Scale size={12} />
                  <span>Compare with {currentCompareOption.name}</span>
                </button>
                <button
                  type="button"
                  className="ai-stylist-chip-switch-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setCompareIndex((prev) => (prev + 1) % compareOptions.length);
                  }}
                  title="Switch comparison product option"
                >
                  ⇄ Switch
                </button>
              </div>
            </div>

            {/* Interactive Input Field */}
            <form
              className="ai-stylist-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask anything about this product..."
                value={inPageQuery}
                onChange={(e) => setInPageQuery(e.target.value)}
              />
              <button
                type="submit"
                className="ai-stylist-send-btn"
                disabled={!inPageQuery.trim()}
                aria-label="Send query"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </section>

        {/* =========================================================================
            3. MIDDLE SECTION: 3 FEATURE CARDS SUITE (Side-by-Side)
           ========================================================================= */}
        <section className="dark-middle-suite-grid">
          {/* Card 1: Virtual On-Foot Try On */}
          <div className="dark-feature-card dark-tryon-card">
            <div className="tryon-card-media">
              <img
                src="https://i.pinimg.com/736x/9b/29/97/9b29978c7b3a5fa521f50262ab031f7c.jpg"
                alt="On Foot Try On"
              />
            </div>
            <div className="tryon-card-content">
              <h4 className="suite-card-title">Virtual On-Foot Try On</h4>
              <p className="suite-card-sub">
                See how these shoes look on your feet using AI.
              </p>
              <button
                type="button"
                className="suite-btn-action"
                onClick={() => setIsTryOnOpen(true)}
              >
                <Camera size={13} />
                <span>Try On Now</span>
              </button>
            </div>
            <button
              type="button"
              className="suite-arrow-btn"
              onClick={() => setIsTryOnOpen(true)}
              aria-label="Launch try on"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Card 2: Complete the Look */}
          <div id="complete-the-look-section" className="dark-feature-card dark-outfit-card">
            <div className="outfit-card-header">
              <h4 className="suite-card-title">Complete the Look</h4>
              <span className="outfit-card-badge">✨ 3-Piece Bundle</span>
            </div>
            <div
              className="outfit-items-row"
              onClick={() => setIsOutfitModalOpen(true)}
              title="Click to preview outfit & pick sizes"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setIsOutfitModalOpen(true);
                }
              }}
            >
              <div className="outfit-item-thumb">
                <img src={currentImage} alt="Sneaker" />
              </div>
              <span className="outfit-plus">+</span>
              <div className="outfit-item-thumb">
                <img
                  src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80"
                  alt="Denim Jeans"
                />
              </div>
              <span className="outfit-plus">+</span>
              <div className="outfit-item-thumb">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80"
                  alt="Tee and Cap"
                />
              </div>
            </div>
            <button
              type="button"
              className="suite-btn-complete-outfit"
              onClick={() => setIsOutfitModalOpen(true)}
            >
              <span>Buy Complete Outfit</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Card 3: AI Insights */}
          <div className="dark-feature-card dark-insights-card">
            <h4 className="suite-card-title">AI Insights</h4>
            <div className="insights-stats-grid">
              <div className="insight-stat-tile">
                <div className="insight-stat-icon gold-heart">💛</div>
                <div className="insight-stat-num">95%</div>
                <div className="insight-stat-label">Style Match</div>
              </div>

              <div className="insight-stat-tile">
                <div className="insight-stat-icon teal-return">↻</div>
                <div className="insight-stat-num">2%</div>
                <div className="insight-stat-label">Return Rate</div>
              </div>

              <div className="insight-stat-tile">
                <div className="insight-stat-icon gold-star">★</div>
                <div className="insight-stat-num">4.8/5</div>
                <div className="insight-stat-label">Customer Rating</div>
              </div>

              <div className="insight-stat-tile">
                <div className="insight-stat-icon purple-trending">#4</div>
                <div className="insight-stat-num">Trending</div>
                <div className="insight-stat-label">This Week</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. BOTTOM SECTION: TABS & RECOMMENDED PRODUCTS GRID
           ========================================================================= */}
        <section id="bottom-tabs-section" className="dark-bottom-recommendations-section">
          {/* Header & Tabs */}
          <div className="dark-tabs-header-row">
            <div className="dark-recommend-tabs">
              {[
                "Recommended by AI",
                "Similar Products",
                "You May Also Like",
                "Recently Viewed",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`dark-tab-item ${activeBottomTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveBottomTab(tab);
                    toast.success(`Showing ${tab} ✨`);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link href="/shop?category=Footwear" className="dark-viewall-link">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Dynamic Product Cards Grid based on selected tab */}
          <div className="dark-products-carousel-row" key={activeBottomTab}>
            {currentTabProducts.map((item) => {
              const isItemWishlisted = wishlist.some((w) => w.id === item.id);
              return (
                <div key={item.id} className="dark-sneaker-card">
                  {/* Category / AI Tag */}
                  {item.badge && (
                    <span className="sneaker-card-badge">{item.badge}</span>
                  )}

                  {/* Top Heart Icon */}
                  <button
                    type="button"
                    className="sneaker-card-heart"
                    onClick={() => toggleWishlist(item)}
                    aria-label="Wishlist item"
                  >
                    <Heart
                      size={15}
                      fill={isItemWishlisted ? "#e11d48" : "none"}
                      color={isItemWishlisted ? "#e11d48" : "#8b949e"}
                    />
                  </button>

                  {/* Sneaker Image */}
                  <Link href={`/product/${item.id}`} className="sneaker-card-img-wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </Link>

                  {/* Sneaker Info */}
                  <div className="sneaker-card-info">
                    <Link href={`/product/${item.id}`} className="sneaker-card-title">
                      {item.name}
                    </Link>
                    <div className="sneaker-card-bottom">
                      <span className="sneaker-card-price">{formatPrice(item.price)}</span>
                      <div className="sneaker-card-rating">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>{item.rating || 4.8}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Review Summarizer */}
        <div className="dark-reviews-wrapper">
          <AIReviewSummarizer productId={product.id} productName={product.name} />
        </div>
      </main>

      {/* =========================================================================
          STICKY BUY BAR ON SCROLL
         ========================================================================= */}
      <div className={`dark-sticky-buy-bar ${showStickyBar ? "visible" : ""}`}>
        <div className="dark-sticky-container">
          <div className="sticky-meta-wrap">
            <img src={currentImage} alt={product.name} className="sticky-shoe-thumb" />
            <div>
              <div className="sticky-title">{product.name}</div>
              <div className="sticky-price-row">
                <span>{formatPrice(product.price)}</span>
                <span className="sticky-size-tag">Size: {selectedVariant}</span>
              </div>
            </div>
          </div>

          <div className="sticky-actions-wrap">
            <button
              type="button"
              className="sticky-add-btn"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={15} />
              <span>+ Bag</span>
            </button>
            <button
              type="button"
              className="sticky-buy-btn"
              onClick={handleBuyNow}
            >
              <Zap size={15} fill="#000" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULLSCREEN ZOOM LIGHTBOX MODAL
         ========================================================================= */}
      {isFullscreenOpen && (
        <div className="dark-lightbox-backdrop" onClick={() => setIsFullscreenOpen(false)}>
          <button
            type="button"
            className="dark-lightbox-close"
            onClick={() => setIsFullscreenOpen(false)}
            aria-label="Close fullscreen view"
          >
            <X size={24} />
          </button>
          <div className="dark-lightbox-img-box" onClick={(e) => e.stopPropagation()}>
            <img src={currentImage} alt={product.name} />
            <div className="dark-lightbox-footer">
              <span>{product.name}</span>
              <span>Angle {selectedImageIndex + 1} of {images.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIRTUAL TRY-ON MODAL
         ========================================================================= */}
      {isTryOnOpen && (
        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={product}
        />
      )}

      {/* =========================================================================
          SIZE GUIDE MODAL
         ========================================================================= */}
      {showSizeGuide && (
        <div
          className="dark-lightbox-backdrop"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="dark-size-guide-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-guide-header">
              <h3>Footwear Sizing Chart</h3>
              <button
                type="button"
                className="guide-close-btn"
                onClick={() => setShowSizeGuide(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="size-guide-intro">
              Universal sizing matrix for Nike, Jordan & sneaker silhouettes:
            </p>
            <table className="dark-size-table">
              <thead>
                <tr>
                  <th>UK / India</th>
                  <th>US Men</th>
                  <th>EU</th>
                  <th>Foot Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>UK 6</strong></td>
                  <td>US 7</td>
                  <td>40</td>
                  <td>25.0 cm</td>
                </tr>
                <tr>
                  <td><strong>UK 7</strong></td>
                  <td>US 8</td>
                  <td>41</td>
                  <td>25.5 cm</td>
                </tr>
                <tr>
                  <td><strong>UK 8</strong></td>
                  <td>US 9</td>
                  <td>42.5</td>
                  <td>26.5 cm</td>
                </tr>
                <tr className="recommended-row">
                  <td><strong>UK 9 ✨ (Recommended)</strong></td>
                  <td>US 10</td>
                  <td>44</td>
                  <td>27.5 cm</td>
                </tr>
                <tr>
                  <td><strong>UK 10</strong></td>
                  <td>US 11</td>
                  <td>45</td>
                  <td>28.5 cm</td>
                </tr>
                <tr>
                  <td><strong>UK 11</strong></td>
                  <td>US 12</td>
                  <td>46</td>
                  <td>29.5 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPLETE THE LOOK OUTFIT CUSTOMIZATION & BUY MODAL
         ========================================================================= */}
      {isOutfitModalOpen && (
        <div
          className="dark-outfit-modal-backdrop"
          onClick={() => setIsOutfitModalOpen(false)}
        >
          <div
            className="dark-outfit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="outfit-modal-title"
          >
            {/* Modal Header */}
            <div className="dark-outfit-modal-header">
              <div className="outfit-modal-title-group">
                <div className="outfit-modal-pill">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>AI Curated 3-Piece Ensemble</span>
                </div>
                <h3 id="outfit-modal-title" className="outfit-modal-heading">
                  Complete the Look
                </h3>
                <p className="outfit-modal-subtitle">
                  Inspect each piece, pick your sizes, and review bundle pricing before adding to your bag.
                </p>
              </div>
              <button
                type="button"
                className="outfit-modal-close-btn"
                onClick={() => setIsOutfitModalOpen(false)}
                aria-label="Close outfit preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Items List */}
            <div className="dark-outfit-items-list">
              {outfitPieces.map((piece) => {
                const isSelected = outfitSelectedItems[piece.key];
                const currentSize = outfitSizes[piece.key];

                return (
                  <div
                    key={piece.key}
                    className={`dark-outfit-piece-card ${
                      isSelected ? "is-selected" : "is-deselected"
                    }`}
                  >
                    {/* Item Top Row */}
                    <div className="outfit-piece-top">
                      <label
                        className="outfit-checkbox-container"
                        title="Include/Exclude this item"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setOutfitSelectedItems((prev) => ({
                              ...prev,
                              [piece.key]: e.target.checked,
                            }));
                          }}
                        />
                        <span className="outfit-checkbox-custom">
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </span>
                      </label>

                      <div className="outfit-piece-image-wrap">
                        <img src={piece.image} alt={piece.name} />
                        <span className="outfit-piece-tag">{piece.tag}</span>
                      </div>

                      <div className="outfit-piece-info">
                        <div className="outfit-piece-meta">
                          <span className="outfit-piece-cat">{piece.category}</span>
                          <span className="outfit-piece-price">
                            ₹{piece.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <h4 className="outfit-piece-title">{piece.name}</h4>
                        <p className="outfit-piece-desc">{piece.desc}</p>
                      </div>
                    </div>

                    {/* Size Selector Section */}
                    {isSelected && (
                      <div className="outfit-piece-size-section">
                        <div className="outfit-size-header">
                          <span className="outfit-size-title">
                            {piece.sizeType}:
                          </span>
                          <span className="outfit-size-current">
                            Selected: <strong>{currentSize}</strong>
                          </span>
                        </div>

                        <div className="outfit-size-pills-row">
                          {piece.sizes.map((size) => {
                            const active = currentSize === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                className={`outfit-size-btn ${active ? "active" : ""}`}
                                onClick={() => {
                                  setOutfitSizes((prev) => ({
                                    ...prev,
                                    [piece.key]: size,
                                  }));
                                }}
                              >
                                {size}
                                {active && <Check size={11} className="outfit-size-check" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom / Summary & Action Bar */}
            <div className="dark-outfit-modal-footer">
              <div className="outfit-footer-summary">
                <div className="outfit-summary-badges">
                  {outfitPricing.isFullBundle ? (
                    <span className="outfit-discount-tag">
                      🏷️ 10% Bundle Discount Applied (-₹{outfitPricing.discountAmount.toLocaleString("en-IN")})
                    </span>
                  ) : (
                    <span className="outfit-selection-tag">
                      {outfitPricing.selectedCount} of 3 Items Selected
                    </span>
                  )}
                  <span className="outfit-delivery-tag">
                    <Truck size={12} /> Free Express Delivery
                  </span>
                </div>

                <div className="outfit-total-price-box">
                  <span className="outfit-total-label">Total Outfit Price:</span>
                  <div className="outfit-price-numbers">
                    {outfitPricing.discountAmount > 0 && (
                      <span className="outfit-original-price">
                        ₹{outfitPricing.originalTotal.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="outfit-final-price">
                      ₹{outfitPricing.finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="outfit-footer-actions">
                <button
                  type="button"
                  className="outfit-btn-add-bag"
                  onClick={() => handleConfirmOutfitCart({ checkout: false })}
                  disabled={outfitPricing.selectedCount === 0}
                >
                  <ShoppingBag size={17} />
                  <span>Add Outfit to Bag</span>
                </button>
                <button
                  type="button"
                  className="outfit-btn-buy-now"
                  onClick={() => handleConfirmOutfitCart({ checkout: true })}
                  disabled={outfitPricing.selectedCount === 0}
                >
                  <Zap size={17} />
                  <span>Buy Now ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}