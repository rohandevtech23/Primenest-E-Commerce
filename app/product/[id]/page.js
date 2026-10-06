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
  Laptop,
  Droplets,
  RotateCcw,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
// import VirtualTryOnModal from "@/components/VirtualTryOnModal"; // Temporarily disabled: Virtual Try-On
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
  const [selectedVariant, setSelectedVariant] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedRecently, setAddedRecently] = useState(false);
  // const [isTryOnOpen, setIsTryOnOpen] = useState(false); // Temporarily disabled: Virtual Try-On
  const [isDescExpanded, setIsDescExpanded] = useState(false);
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

  // Precise Category detection
  const subLower = (product?.subcategory || "").toLowerCase();
  const nameLower = (product?.name || "").toLowerCase();
  const catLower = (product?.category || "").toLowerCase();

  const isFootwear = Boolean(
    catLower === "footwear" ||
    subLower.includes("shoes") ||
    subLower.includes("sneaker") ||
    subLower.includes("footwear") ||
    nameLower.includes("sneaker") ||
    nameLower.includes("shoe")
  );

  const isBagOrAccessory = Boolean(
    catLower === "accessories" ||
    subLower.includes("bag") ||
    subLower.includes("backpack") ||
    subLower.includes("handbag") ||
    subLower.includes("tote") ||
    subLower.includes("wallet") ||
    subLower.includes("watch") ||
    subLower.includes("cap") ||
    subLower.includes("sunglass") ||
    nameLower.includes("backpack") ||
    nameLower.includes("bag") ||
    nameLower.includes("pack") ||
    nameLower.includes("wallet") ||
    nameLower.includes("watch")
  );

  const isPerfume = Boolean(
    catLower === "perfume" ||
    subLower.includes("perfume") ||
    subLower.includes("fragrance") ||
    nameLower.includes("perfume") ||
    nameLower.includes("flacon")
  );

  const isClothing = !isFootwear && !isBagOrAccessory && !isPerfume;
  const hasSizeSelection = !isBagOrAccessory && !isPerfume && (isClothing || isFootwear);

  // Dynamic comparison options from store catalog
  const compareOptions = useMemo(() => {
    if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
      return relatedProducts.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name.length > 28 ? p.name.slice(0, 27) + "..." : p.name,
        price: typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : `₹${p.price}`,
      }));
    }

    if (isBagOrAccessory) {
      return [
        { name: "Demon Slayer: Tanjiro Pack", price: "₹2,799" },
        { name: "Punisher Tactical Gear", price: "₹3,299" },
        { name: "Black Panther Tactical Pack", price: "₹3,499" },
      ];
    }

    if (isPerfume) {
      return [
        { name: "House Of The Dragon Extrait", price: "₹4,999" },
        { name: "Sea & Cedar Coastal Noir", price: "₹3,899" },
        { name: "Cosmic Trilogy Set", price: "₹7,499" },
      ];
    }

    if (isClothing) {
      return [
        { name: "White Regular Fit Crew Tee", price: "₹999" },
        { name: "Men Red Relaxed Fit Tee", price: "₹1,499" },
        { name: "Men White Relaxed Fit Tee", price: "₹1,299" },
        { name: "Men Grey Regular Fit Tee", price: "₹999" },
      ];
    }

    return [
      { name: "Puma Palermo", price: "₹6,299" },
      { name: "Nike Court Vision", price: "₹5,999" },
      { name: "Air Jordan 1 High", price: "₹9,500" },
    ];
  }, [relatedProducts, isBagOrAccessory, isPerfume, isClothing]);

  const [compareIndex, setCompareIndex] = useState(0);
  const currentCompareOption =
    compareOptions[compareIndex % (compareOptions.length || 1)] || compareOptions[0];

  // Dynamic Category-Specific Quick Prompt Chips
  const quickPromptChips = useMemo(() => {
    if (isBagOrAccessory) {
      return [
        { label: "Is this good for daily use?", icon: Clock, query: "Is this good for daily use?" },
        { label: "What is the laptop capacity?", icon: Laptop, query: "What is the laptop capacity?" },
        { label: "Is it water resistant?", icon: Droplets, query: "Is it water resistant?" },
        { label: "Show similar bags & packs", icon: Sparkles, query: "Show similar bags & packs" },
        { label: "Show cheaper options", icon: Tag, query: "Show cheaper options" },
      ];
    }
    if (isFootwear) {
      return [
        { label: "Is this good for daily walking?", icon: Clock, query: "Is this good for daily walking?" },
        { label: "Is the sizing true to size?", icon: CheckCircle2, query: "Is the sizing true to size?" },
        { label: "Sneaker care & cleaning tips", icon: ShieldCheck, query: "Sneaker care & cleaning tips" },
        { label: "Show similar sneakers", icon: Sparkles, query: "Show similar sneakers" },
        { label: "Show cheaper options", icon: Tag, query: "Show cheaper options" },
      ];
    }
    if (isPerfume) {
      return [
        { label: "What are the fragrance notes?", icon: Sparkles, query: "What are the fragrance notes?" },
        { label: "How long does the scent last?", icon: Clock, query: "How long does the scent last?" },
        { label: "Best for day or evening wear?", icon: Flame, query: "Best for day or evening wear?" },
        { label: "Show similar fragrances", icon: Sparkles, query: "Show similar fragrances" },
        { label: "Show cheaper options", icon: Tag, query: "Show cheaper options" },
      ];
    }
    return [
      { label: "Is this good for daily wear?", icon: Clock, query: "Is this good for daily wear?" },
      { label: "How is the fit & fabric?", icon: Shirt, query: "How is the fit & fabric?" },
      { label: "Can I wear this with jeans?", icon: Sparkles, query: "Can I wear this with jeans?" },
      { label: "Show similar tees & shirts", icon: Sparkles, query: "Show similar tees & shirts" },
      { label: "Show cheaper options", icon: Tag, query: "Show cheaper options" },
    ];
  }, [isBagOrAccessory, isFootwear, isPerfume]);

  // AI Stylist chat conversation inside the right column panel
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      id: "init",
      sender: "ai",
      text: "Hi! 👋 I'm your PrimeNest AI Concierge. I can help answer questions about this piece, check dimensions & materials, suggest styling options, or compare catalog items.",
    },
  ]);

  const handleResetAiChat = () => {
    setAiChatMessages([
      {
        id: `init-${Date.now()}`,
        sender: "ai",
        text: `Hi! 👋 I'm your PrimeNest AI Concierge for ${product?.name || "this piece"}. I can assist with dimensions, material specs, styling recommendations, or compare with other catalog pieces.`,
      },
    ]);
    setInPageQuery("");
  };

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
        setIsDescExpanded(false);

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

        // Default variant selection based on product category (L for clothing, UK 9 for footwear)
        const sub = (data.product?.subcategory || "").toLowerCase();
        const cat = (data.product?.category || "").toLowerCase();
        const nm = (data.product?.name || "").toLowerCase();
        const isFoot = cat === "footwear" || sub.includes("shoes") || sub.includes("sneaker") || nm.includes("sneaker");
        const isCloth = !isFoot && (cat === "men" || cat === "women" || cat === "kids" || sub.includes("shirt") || sub.includes("t-shirt") || sub.includes("polo") || nm.includes("shirt") || nm.includes("t-shirt"));
        const targetDefault = isCloth ? "L" : "UK 9";

        if (Array.isArray(data.product?.variants) && data.product.variants.length > 0) {
          const hasTarget = data.product.variants.some(
            (v) => (v.label || v) === targetDefault
          );
          setSelectedVariant(hasTarget ? targetDefault : data.product.variants[0].label || data.product.variants[0]);
        } else {
          setSelectedVariant(targetDefault);
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

  // Default clothing size options: XS, S, M, L, XL, XXL
  const defaultClothingSizes = [
    { label: "XS", stock: 8 },
    { label: "S", stock: 15 },
    { label: "M", stock: 20 },
    { label: "L", stock: 18 },
    { label: "XL", stock: 12 },
    { label: "XXL", stock: 6 },
  ];

  // Default shoe size options: UK 6 to UK 11
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
      : isClothing
      ? defaultClothingSizes
      : isFootwear
      ? defaultShoeSizes
      : defaultClothingSizes;

  const recommendedSize = isClothing ? "L" : "UK 9";

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
      toast.error(isClothing ? "Please select your size before adding to bag." : "Please select your shoe size before adding to bag.");
      return;
    }
    if (quantity < 1 || quantity > availableStock) return;

    const cartProduct = {
      ...product,
      selectedVariant: activeVariant || { label: selectedVariant },
      variantLabel: selectedVariant,
      color: isClothing ? undefined : selectedColor,
    };

    addToCart(cartProduct, quantity);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 2400);
  };

  const handleBuyNow = () => {
    if (hasVariants && !activeVariant) {
      toast.error(isClothing ? "Please select your size to proceed." : "Please select your shoe size to proceed.");
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
    const apparelSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const shoeSizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
    const productSizes =
      Array.isArray(product?.variants) && product.variants.length > 0
        ? product.variants.map((v) =>
            typeof v === "object" ? v.label || v.size || v.name : String(v)
          )
        : isClothing
        ? apparelSizes
        : shoeSizes;

    if (isClothing) {
      return [
        {
          key: "tee",
          id: product?.id || 187,
          name: product?.name || "Premium Cotton Tee",
          category: product?.subcategory || "Apparel",
          tag: "Core Top",
          price: Number(product?.price) || 1299,
          image:
            currentImage ||
            product?.images?.[0] ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
          sizes: productSizes,
          sizeType: "Size (Chest)",
          desc: "100% breathable pure cotton jersey with comfortable relaxed drape",
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
          key: "shoe",
          id: 104,
          name: "Minimalist Low-Top Court Sneakers",
          category: "Footwear",
          tag: "Clean Court",
          price: 3499,
          image:
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
          sizes: shoeSizes,
          sizeType: "Shoe Size (UK)",
          desc: "Sleek low-profile white sneakers designed for effortless daily styling",
        },
      ];
    }

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
        sizes: productSizes,
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
  }, [product, currentImage, isClothing]);

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
  // Default apparel catalog products
  const defaultApparelProducts = [
    {
      id: 141,
      name: "White Regular Fit Crew-Neck Tee",
      price: 999,
      rating: 4.8,
      image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/8/b86c4e8685816001_1.jpg?rnd=20200526195200",
      category: "Men",
      badge: "98% AI Match",
    },
    {
      id: 144,
      name: "Men Red Relaxed Fit Printed Tee",
      price: 1499,
      rating: 4.7,
      image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/3/d/3dd0cc51344928012_1.jpg?rnd=20200526195200",
      category: "Men",
      badge: "96% AI Match",
    },
    {
      id: 145,
      name: "Men White Relaxed Fit Graphic Tee",
      price: 1299,
      rating: 4.6,
      image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/3/d/3dd0cc51344928011_1.jpg?rnd=20200526195200",
      category: "Men",
      badge: "95% AI Match",
    },
    {
      id: 143,
      name: "Men Grey Regular Fit Crew Tee",
      price: 999,
      rating: 4.5,
      image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/8/b86c4e8685816266_3.jpg?rnd=20200526195200",
      category: "Men",
      badge: "94% AI Match",
    },
    {
      id: 187,
      name: "Relaxed Fit Cotton Mustard Polo Tee",
      price: 1499,
      rating: 4.9,
      image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/6/a/6a7491563230569_1.jpg",
      category: "Men",
      badge: "Trending Pick",
    },
  ];

  // Default footwear products
  const defaultSneakerProducts = [
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
  ];

  const aiRecommendedProducts = useMemo(() => {
    return isClothing ? defaultApparelProducts : defaultSneakerProducts;
  }, [isClothing]);

  const catalogSimilarProducts = useMemo(() => {
    const fallbackList = isClothing ? defaultApparelProducts : defaultSneakerProducts;

    if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
      const dbMapped = relatedProducts.map((p) => {
        let cleanName = p.name || (isClothing ? "Cotton T-Shirt" : "Sneaker");
        if (cleanName.length > 25) {
          cleanName = cleanName.slice(0, 24) + "...";
        }

        let cleanImage = p.image || p.image_url;
        if (!cleanImage || cleanImage.includes("sneakernews.com")) {
          cleanImage = isClothing
            ? "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/8/b86c4e8685816001_1.jpg?rnd=20200526195200"
            : "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80";
        }

        return {
          id: p.id,
          name: cleanName,
          price: Number(p.price) || (isClothing ? 1299 : 8200),
          rating: 4.8,
          image: cleanImage,
          category: p.category || (isClothing ? "Men" : "Footwear"),
          badge: isClothing ? "Similar Fit" : "Similar Silhouette",
        };
      });

      const extra = fallbackList.filter(
        (s) => !dbMapped.some((d) => String(d.id) === String(s.id))
      );
      return [...dbMapped, ...extra].slice(0, 6);
    }
    return fallbackList;
  }, [relatedProducts, isClothing]);

  const youMayAlsoLikeProducts = useMemo(() => {
    if (isClothing) {
      return [
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
          id: 994,
          name: "Minimalist White Low-Tops",
          price: 3499,
          rating: 4.7,
          image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
          category: "Footwear",
          badge: "Sneaker Pairing",
        },
        {
          id: 993,
          name: "Atelier French Terry Oversized Hoodie",
          price: 3499,
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
          category: "Men",
          badge: "Layering Piece",
        },
        {
          id: 995,
          name: "Pleated Relaxed Cotton Trousers",
          price: 2199,
          rating: 4.6,
          image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
          category: "Men",
          badge: "Smart Casual",
        },
      ];
    }
    return [
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
        name: "Heavyweight Boxy Fit Cotton Tee",
        price: 1899,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        category: "Men",
        badge: "Summer Essential",
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
    ];
  }, [isClothing]);

  // Dynamic active tab product retriever
  const currentTabProducts = useMemo(() => {
    switch (activeBottomTab) {
      case "Similar Products":
        return catalogSimilarProducts;
      case "You May Also Like":
        return youMayAlsoLikeProducts;
      case "Recently Viewed":
        return recentlyViewedList.length > 0 ? recentlyViewedList : catalogSimilarProducts;
      case "Recommended by AI":
      default:
        return aiRecommendedProducts;
    }
  }, [activeBottomTab, catalogSimilarProducts, youMayAlsoLikeProducts, aiRecommendedProducts, recentlyViewedList]);

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

    // 1. Laptop / Dimension / Capacity query
    if (lower.includes("laptop") || lower.includes("capacity") || lower.includes("dimension")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: isBagOrAccessory
              ? `💼 Laptop & Capacity Specifications:\n\n• Laptop Sleeve: Dedicated shock-absorbent padded compartment fits up to 16-inch laptops (MacBook Pro 16", Dell XPS 15/16, Lenovo ThinkPad).\n• Volume Capacity: Approximately 28L (49 cm H × 31 cm W × 18 cm D), weighing only 0.94 kg.\n• Compartments: Dual quick-access front tech zip organizers, side water bottle holder, and hidden passport security pocket.`
              : isFootwear
              ? `👟 Sizing & Fit:\n\n• Standard UK/IN sizing with a comfortable anatomical toe box.\n• Encapsulated cushioning provides superior all-day arch stability.`
              : `👕 Size & Silhouette:\n\n• True-to-size relaxed silhouette with pre-shrunk pure cotton jersey fabric.`,
          },
        ]);
        setAiTyping(false);
      }, 500);
      return;
    }

    // 2. Water Resistance / Weather query
    if (lower.includes("water") || lower.includes("rain") || lower.includes("weather")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: isBagOrAccessory
              ? `🌧️ Weather-Repellent Architecture:\n\n• Outer Fabric: Crafted from 1000D abrasion-resistant heavy-duty polyester with hydrophobic outer coating.\n• Interior: Fully lined with water-resistant polyester to protect electronics and books during sudden rain showers.\n• Zippers: Heavy-duty cord-pull closures with protective rain barrier flaps.`
              : `🌧️ Weather Durability:\n\n• Crafted with weather-ready materials for all-season longevity.`,
          },
        ]);
        setAiTyping(false);
      }, 500);
      return;
    }

    // 3. Similar items query
    if (lower.includes("similar") || lower.includes("alternative") || lower.includes("tee") || lower.includes("pack") || lower.includes("bag")) {
      setTimeout(() => {
        const catalogItems = (relatedProducts && relatedProducts.length > 0 ? relatedProducts : defaultApparelProducts)
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            name: p.name.length > 25 ? p.name.slice(0, 24) + "..." : p.name,
            price: typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : `₹${p.price}`,
            image: p.image || p.image_url || "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1773818212_5017226.jpg?w=480&dpr=2",
          }));

        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: isBagOrAccessory
              ? `Here are 3 top-rated utility backpacks & gear pieces from the PrimeNest luxury catalog:`
              : isClothing
              ? `Here are 3 great similar t-shirts & shirts matching this fit and pure cotton fabric:`
              : `Here are 3 similar footwear styles based on silhouette & street presence:`,
            products: catalogItems,
            action: "view_similar_tab",
          },
        ]);
        setAiTyping(false);
        setActiveBottomTab("Similar Products");
      }, 500);
      return;
    }

    // 4. Jeans / Styling query
    if (lower.includes("jean") || lower.includes("denim") || lower.includes("pant") || lower.includes("wear")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: isBagOrAccessory
              ? `✨ Styling & Commute Pairing:\n\n• Urban Streetwear: Pairs seamlessly with relaxed cargo trousers, hoodies, and sneakers.\n• Casual Denim: Looks assertive over dark raw denim and an overshirt.\n• College / Travel: Effortless over a bomber jacket and technical chinos.`
              : isClothing
              ? `✨ Denim Styling Guide for ${product?.name || "this tee"}:\n\n• Baggy / Wide-Leg Denim: Relaxed streetwear silhouette.\n• Slim / Straight Dark Indigo: Elevated smart-casual look.\n• Linen Trousers or Cargo Pants: Effortless weekend comfort.`
              : `✨ Denim Styling Guide for ${product?.name || "Air Jordan 1 Low"}:\n\n• Slim / Straight Dark Indigo: Clean, tailored, elevated look.\n• Washed Black Denim: High-contrast urban street aesthetic.\n• Relaxed Cargo Denim: On-trend relaxed streetwear silhouette.`,
          },
        ]);
        setAiTyping(false);
      }, 500);
      return;
    }

    // 5. Cheaper options query
    if (lower.includes("cheap") || lower.includes("budget") || lower.includes("price") || lower.includes("under")) {
      setTimeout(() => {
        const cheapItems = (relatedProducts && relatedProducts.length > 0
          ? [...relatedProducts].sort((a, b) => Number(a.price) - Number(b.price))
          : defaultApparelProducts
        ).slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name.length > 25 ? p.name.slice(0, 24) + "..." : p.name,
          price: typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : `₹${p.price}`,
          image: p.image || p.image_url || "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1773818212_5017226.jpg?w=480&dpr=2",
        }));

        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `Here are great budget-friendly pieces matching your style:`,
            products: cheapItems,
            action: "view_similar_tab",
          },
        ]);
        setAiTyping(false);
        setActiveBottomTab("Similar Products");
      }, 500);
      return;
    }

    // 6. Compare with alternative products query
    if (lower.includes("compare") || lower.includes("vs")) {
      let title = `⚖️ ${product?.name || "This Product"} vs ${currentCompareOption?.name || "Alternative Item"}:`;
      let details = "";

      if (isBagOrAccessory) {
        details = `• Architecture: Punisher Tactical features 28L capacity with 1000D abrasion-resistant exterior vs ${currentCompareOption?.name}.\n• Laptop Protection: Dedicated padded 16" tech sleeve with air-mesh spine ventilation.\n• Pricing: ${product?.name || "This bag"} (${formatPrice(product?.price)}) vs ${currentCompareOption?.name} (${currentCompareOption?.price || "₹2,799"}).`;
      } else if (isClothing) {
        details = `• Fabric & Feel: Premium breathable cotton jersey with reinforced stitching.\n• Fit: Standard relaxed luxury drape.\n• Value: ${product?.name || "This item"} (${formatPrice(product?.price)}) vs ${currentCompareOption?.name} (${currentCompareOption?.price || "₹1,299"}).`;
      } else {
        details = `• Upper & Cushioning: Encapsulated responsive air cushioning with premium leather overlays.\n• Value: ${product?.name || "This pair"} (${formatPrice(product?.price)}) vs ${currentCompareOption?.name} (${currentCompareOption?.price || "₹5,999"}).`;
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
      }, 500);
      return;
    }

    // 7. Daily use query
    if (lower.includes("daily") || lower.includes("workout") || lower.includes("gym") || lower.includes("college") || lower.includes("travel")) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: isBagOrAccessory
              ? `Yes! The ${product?.name || "Backpack"} is engineered for daily heavy-duty rotation, college classes, gym gear, and travel. Its ergonomic padded straps and air-mesh back paneling ensure zero shoulder fatigue even when carrying a 16" laptop and books.`
              : isClothing
              ? `Yes! The ${product?.name || "t-shirt"} is crafted from 100% breathable, sweat-wicking lightweight cotton jersey, making it ideal for daily casual rotation, college, and warm weather.`
              : `Yes! The ${product?.name || "Sneaker"} is engineered with lightweight cushioning and durable rubber traction, making it exceptionally comfortable for daily street wear.`,
          },
        ]);
        setAiTyping(false);
      }, 500);
      return;
    }

    // 8. Generic / Custom Query -> Call real /api/ai/chat API
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
            text:
              data.reply ||
              `The ${product?.name || "piece"} is rated 4.8/5 with high customer satisfaction for premium craftsmanship and verified durability.`,
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
          text: `The ${product?.name || "piece"} is built with premium materials and high structural durability. Verified with a 4.8/5 rating. Would you like me to compare it with other options or check similar items in the catalog?`,
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
            {product.subcategory || (isClothing ? "T-Shirts" : "Footwear")}
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
                {product.name
                  ? product.name.toUpperCase()
                  : isClothing
                  ? "PREMIUM COTTON"
                  : "PRIMENEST EXCLUSIVE"}
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

                {/* Virtual Try-On Pill (Temporarily disabled)
                <button
                  type="button"
                  className="dark-stage-pill"
                  onClick={() => setIsTryOnOpen(true)}
                  title="Virtual On-Foot Try On with AI"
                >
                  <Camera size={13} />
                  <span>AR Try On</span>
                </button>
                */}

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
              <span className="dark-brand-name">
                {product.brand || (isClothing ? "PRIMENEST APPAREL" : "PRIMENEST LUXURY")}
              </span>
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

            {/* Product Short Description (Clamped to 3 lines with Read all / Show less toggle) */}
            {(() => {
              const descText =
                product.description ||
                (isClothing
                  ? "Crafted from 100% premium breathable cotton jersey, this piece delivers exceptional softness, all-day comfort, and an effortless silhouette for everyday styling."
                  : "Inspired by timeless court heritage, this sneaker combines iconic style, premium craftsmanship, and lightweight comfort for a versatile look that pairs effortlessly with any outfit.");
              const MAX_CHARS = 185;
              const isLongDesc = descText.length > MAX_CHARS;
              const displayText =
                isLongDesc && !isDescExpanded
                  ? `${descText.slice(0, MAX_CHARS).trim()}...`
                  : descText;

              return (
                <div className="dark-product-desc-wrap">
                  <p
                    className={`dark-product-desc ${
                      isLongDesc && !isDescExpanded ? "clamped" : "expanded"
                    }`}
                  >
                    {displayText}
                  </p>
                  {isLongDesc && (
                    <button
                      type="button"
                      className="dark-desc-toggle-btn"
                      onClick={() => setIsDescExpanded((prev) => !prev)}
                      aria-expanded={isDescExpanded}
                    >
                      {isDescExpanded ? (
                        <>
                          Show less <ChevronUp size={13} />
                        </>
                      ) : (
                        <>
                          Read all <ChevronDown size={13} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Color Swatches - Hide for T-Shirts / Shirts / Clothing */}
            {!isClothing && isFootwear && (
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
                          boxShadow: isSelected ? `0 0 0 2px #ffffff, 0 0 0 4px #b45309` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Section - Only shown for clothing and footwear */}
            {hasSizeSelection && (
              <div className="dark-size-section">
                <div className="dark-size-header">
                  <span className="dark-section-label">
                    {isClothing ? "Select Size" : "Size (UK/IN)"}
                  </span>
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
            )}

            {/* Action Buttons: Add to Bag & Buy Now (Symmetrically Aligned) */}
            <div className="dark-action-buttons-row">
              <button
                type="button"
                className="dark-btn-addtobag"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag size={18} />
                <span>{addedRecently ? "Added to Bag!" : "Add to Bag"}</span>
              </button>

              <button
                type="button"
                className="dark-btn-buynow"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <Zap size={18} fill="currentColor" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              COLUMN 3: PrimeNest AI Stylist (Modern Interactive & Animated Glass Concierge)
             ----------------------------------------------------------------------- */}
          <div className="dark-ai-stylist-panel">
            {/* Ambient Animated Glow Aura */}
            <div className="ai-stylist-ambient-glow" />

            {/* Stylist Header */}
            <div className="ai-stylist-header">
              <div className="ai-stylist-avatar-wrap">
                <div className="ai-stylist-icon-badge">
                  <Sparkles size={18} />
                </div>
                <span className="ai-status-pulse-dot" title="Online Concierge" />
              </div>

              <div className="ai-stylist-header-info">
                <div className="ai-stylist-title-row">
                  <h3 className="ai-stylist-title">PrimeNest AI Stylist</h3>
                  <span className="ai-badge-pro">PRO 2.0</span>
                </div>
                <p className="ai-stylist-sub">Your personal luxury shopping concierge</p>
              </div>

              <button
                type="button"
                className="ai-stylist-reset-btn"
                onClick={handleResetAiChat}
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="ai-stylist-chat-stream" ref={chatStreamRef}>
              {aiChatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`ai-message-row ${isUser ? "user-row" : "ai-row"}`}
                  >
                    {!isUser && (
                      <div className="ai-avatar-tiny" aria-hidden="true">
                        <Sparkles size={12} />
                      </div>
                    )}

                    <div className={`ai-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
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
                  </div>
                );
              })}

              {aiTyping && (
                <div className="ai-message-row ai-row">
                  <div className="ai-avatar-tiny" aria-hidden="true">
                    <Sparkles size={12} />
                  </div>
                  <div className="ai-bubble ai-bubble ai-typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips (Category-Aware Interactive Carousel) */}
            <div className="ai-stylist-chips-wrap">
              <div className="ai-chips-scroll">
                {quickPromptChips.map((chip, i) => {
                  const ChipIcon = chip.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="ai-stylist-chip"
                      onClick={() => handleSendChatMessage(chip.query)}
                    >
                      <ChipIcon size={12} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}

                {/* Compare Chip with Quick Switcher */}
                <div className="ai-stylist-chip-compare-group">
                  <button
                    type="button"
                    className="ai-stylist-chip compare-btn"
                    onClick={() => handleSendChatMessage(`Compare with ${currentCompareOption.name}`)}
                  >
                    <Scale size={12} />
                    <span>Compare: {currentCompareOption.name}</span>
                  </button>
                  <button
                    type="button"
                    className="ai-stylist-chip-switch-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setCompareIndex((prev) => (prev + 1) % compareOptions.length);
                    }}
                    title="Switch comparison item"
                  >
                    ⇄
                  </button>
                </div>
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
                placeholder="Ask concierge anything about this piece..."
                value={inPageQuery}
                onChange={(e) => setInPageQuery(e.target.value)}
                aria-label="Ask AI concierge"
              />
              <button
                type="submit"
                className="ai-stylist-send-btn"
                disabled={!inPageQuery.trim()}
                aria-label="Send query"
              >
                <Send size={14} />
              </button>
            </form>
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
          VIRTUAL TRY-ON MODAL (Temporarily disabled: Virtual Try-On)
         ========================================================================= */}
      {/* {isTryOnOpen && (
        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={product}
        />
      )} */}

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
              <h3>{isClothing ? "T-Shirt & Shirt Size Chart" : "Footwear Sizing Chart"}</h3>
              <button
                type="button"
                className="guide-close-btn"
                onClick={() => setShowSizeGuide(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="size-guide-intro">
              {isClothing
                ? "Standard body & garment measurements in inches & cm for regular, relaxed & oversized fit tees:"
                : "Universal sizing matrix for sneaker & footwear silhouettes:"}
            </p>

            {isClothing ? (
              <>
                <table className="dark-size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest (Inches)</th>
                      <th>Length (Inches)</th>
                      <th>Shoulder (Inches)</th>
                      <th>Chest (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>XS</strong></td>
                      <td>36 in</td>
                      <td>26.5 in</td>
                      <td>16.5 in</td>
                      <td>91 cm</td>
                    </tr>
                    <tr>
                      <td><strong>S</strong></td>
                      <td>38 in</td>
                      <td>27.5 in</td>
                      <td>17.5 in</td>
                      <td>96 cm</td>
                    </tr>
                    <tr>
                      <td><strong>M</strong></td>
                      <td>40 in</td>
                      <td>28.5 in</td>
                      <td>18.5 in</td>
                      <td>102 cm</td>
                    </tr>
                    <tr className="recommended-row">
                      <td><strong>L ✨ (Recommended)</strong></td>
                      <td>42 in</td>
                      <td>29.5 in</td>
                      <td>19.5 in</td>
                      <td>107 cm</td>
                    </tr>
                    <tr>
                      <td><strong>XL</strong></td>
                      <td>44 in</td>
                      <td>30.5 in</td>
                      <td>20.5 in</td>
                      <td>112 cm</td>
                    </tr>
                    <tr>
                      <td><strong>XXL</strong></td>
                      <td>46 in</td>
                      <td>31.5 in</td>
                      <td>21.5 in</td>
                      <td>117 cm</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: "14px", padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", fontSize: "12px", color: "#92400e" }}>
                  💡 <strong>Fit Tip:</strong> For modern relaxed or oversized fit streetwear, choose your standard size. For an athletic slim fit, consider sizing one step down.
                </div>
              </>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}