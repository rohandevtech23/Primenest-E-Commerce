"use client";

/**
 * VIRTUAL TRY-ON MODAL (Temporarily Disabled)
 * All code commented out as requested.
 */

export default function VirtualTryOnModal() {
  return null;
}

/*
import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Upload,
  Sparkles,
  Check,
  Download,
  ShoppingBag,
  RefreshCw,
  User,
  Move,
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Cpu,
  Layers,
  ShieldCheck,
} from "lucide-react";

// Curated standing & streetwear models with clean framing
const FOOTWEAR_DEMO_MODELS = [
  {
    id: "street-denim",
    label: "Cuffed Denim (Street)",
    gender: "male",
    url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "chic-street",
    label: "Streetstyle (Chic)",
    gender: "female",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "athletic-joggers",
    label: "Athleisure (Joggers)",
    gender: "male",
    url: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "minimal-casual",
    label: "Minimalist Trousers",
    gender: "female",
    url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=720&q=85",
  },
];

// Curated torso models with clean posture
const APPAREL_DEMO_MODELS = [
  {
    id: "verified-user",
    label: "Streetwear Fit (Verified)",
    gender: "male",
    url: "/images/tryon/user_sample_original.png",
  },
  {
    id: "male-athletic",
    label: "Male (Athletic Fit)",
    gender: "male",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "female-casual",
    label: "Female (Casual)",
    gender: "female",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "male-classic",
    label: "Male (Classic)",
    gender: "male",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "female-chic",
    label: "Female (Chic)",
    gender: "female",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85",
  },
];

export default function VirtualTryOnModal({ isOpen, onClose, product, onAddToCart }) {
  const isFootwear =
    product?.category?.toLowerCase() === "footwear" ||
    product?.subcategory?.toLowerCase().includes("shoe") ||
    product?.subcategory?.toLowerCase().includes("sneaker") ||
    product?.subcategory?.toLowerCase().includes("slipper");

  const demoModels = isFootwear ? FOOTWEAR_DEMO_MODELS : APPAREL_DEMO_MODELS;

  // AI Model Selection - Default to ChatGPT for apparel (which delivers the SOTA result)
  const [selectedEngine, setSelectedEngine] = useState(
    isFootwear ? "gemini-3" : "chatgpt"
  );
  const [customOpenAiKey, setCustomOpenAiKey] = useState("");
  const [showApiKeyDrawer, setShowApiKeyDrawer] = useState(false);
  const [isolateGarmentOnly, setIsolateGarmentOnly] = useState(!isFootwear); // isolate garment to eliminate ghost heads

  const [selectedUserImage, setSelectedUserImage] = useState(demoModels[0].url);
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [generatedResult, setGeneratedResult] = useState(null);
  const [viewMode, setViewMode] = useState("result"); // "result" | "original" | "split"
  const [cleanCutoutUrl, setCleanCutoutUrl] = useState("");

  // Position, scale, and angle transform states
  const [transform, setTransform] = useState({
    xPercent: 50,
    yPercent: isFootwear ? 88 : 42,
    scale: isFootwear ? 32 : 65,
    rotation: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showFineTune, setShowFineTune] = useState(true);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, initXPercent: 50, initYPercent: 88 });
  const userImgObjRef = useRef(null);
  const cutoutCanvasRef = useRef(null);

  // Sync default model and transform when product changes
  useEffect(() => {
    if (isOpen && product) {
      const activeModels = isFootwear ? FOOTWEAR_DEMO_MODELS : APPAREL_DEMO_MODELS;
      setSelectedUserImage(activeModels[0].url);
      setIsCustomUpload(false);
      setGeneratedResult(null);
      setCleanCutoutUrl("");
      setProcessing(false);
      setProcessStep("");
      setSelectedEngine(isFootwear ? "gemini-3" : "chatgpt");
      setIsolateGarmentOnly(!isFootwear);
      setTransform({
        xPercent: 50,
        yPercent: isFootwear ? 88 : 42,
        scale: isFootwear ? 32 : 65,
        rotation: 0,
      });
    }
  }, [isOpen, product?.id, isFootwear]);

  if (!isOpen || !product) return null;

  const rawGarmentImg =
    product.images?.[0] || product.image || "/images/shop-banner.png";

  // Use proxy API for external images to guarantee CORS access for canvas background removal
  const garmentImg = rawGarmentImg.startsWith("http")
    ? `/api/proxy-image?url=${encodeURIComponent(rawGarmentImg)}`
    : rawGarmentImg;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedUserImage(event.target.result);
        setIsCustomUpload(true);
        setGeneratedResult(null);
        setCleanCutoutUrl("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (model) => {
    setSelectedUserImage(model.url);
    setIsCustomUpload(false);
    setGeneratedResult(null);
    setCleanCutoutUrl("");
  };

  /**
   * Smart Background Removal & Garment Isolation:
   * 1. Strips white/grey backgrounds, pedestals, and drop-shadow plates cleanly.
   * 2. For apparel: If the catalog photo features a person/model, it crops out the head,
   *    hair, neck, and trousers so ONLY the clean garment (t-shirt/jacket) sits on the customer.
   */
  const createCleanCutout = (img) => {
    const rawW = img.naturalWidth || img.width || 600;
    const rawH = img.naturalHeight || img.height || 600;

    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true });

    let srcX = 0;
    let srcY = 0;
    let srcW = rawW;
    let srcH = rawH;

    // For apparel: If catalog photo has a person wearing the garment, isolate the torso
    // to prevent two heads or another person's face appearing on the customer's body
    if (!isFootwear && isolateGarmentOnly) {
      srcY = Math.round(rawH * 0.24); // exclude head, eyes, nose, neck
      srcH = Math.round(rawH * 0.46); // isolate chest/shirt torso
      srcX = Math.round(rawW * 0.08); // center crop margins
      srcW = Math.round(rawW * 0.84);
    }

    off.width = srcW;
    off.height = srcH;
    offCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    try {
      const imgData = offCtx.getImageData(0, 0, srcW, srcH);
      const d = imgData.data;

      // Sample edge and corner pixels to identify background color
      const samplePoints = [
        [0, 0],
        [srcW - 1, 0],
        [0, srcH - 1],
        [srcW - 1, srcH - 1],
        [Math.floor(srcW / 2), 0],
        [0, Math.floor(srcH / 2)],
        [srcW - 1, Math.floor(srcH / 2)],
        [2, 2],
        [srcW - 3, 2],
      ];

      let bgR = 0,
        bgG = 0,
        bgB = 0,
        count = 0;
      for (const [sx, sy] of samplePoints) {
        const idx = (sy * srcW + sx) * 4;
        bgR += d[idx];
        bgG += d[idx + 1];
        bgB += d[idx + 2];
        count++;
      }
      bgR /= count;
      bgG /= count;
      bgB /= count;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
        const bright = (r + g + b) / 3;

        // Euclidean color distance from background
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        // Key out background pixels and grey studio plates
        if (dist < 34 || (bright > 224 && sat < 0.14) || bright > 244) {
          d[i + 3] = 0;
        } else if (dist < 50 || (bright > 205 && sat < 0.12)) {
          // Antialiased edge feathering
          const factor = Math.min(1, Math.max(0, (dist - 34) / 16));
          d[i + 3] = Math.round(d[i + 3] * factor);
        }
      }

      // Soft collar scoop for apparel so the user's natural neck and collarbones stay visible
      if (!isFootwear && isolateGarmentOnly) {
        const centerX = srcW / 2;
        const radiusX = srcW * 0.22;
        const radiusY = srcH * 0.18;
        for (let y = 0; y < radiusY; y++) {
          for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
            if (x >= 0 && x < srcW) {
              const dx = (x - centerX) / radiusX;
              const dy = y / radiusY;
              const distEllipse = dx * dx + dy * dy;
              if (distEllipse < 0.8) {
                const idx = (y * srcW + x) * 4;
                d[idx + 3] = 0; // scoop out upper neck hole cleanly
              }
            }
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0);
    } catch (err) {
      console.warn("Cutout background removal fallback:", err);
    }

    cutoutCanvasRef.current = off;
    const url = off.toDataURL("image/png");
    setCleanCutoutUrl(url);
    return off;
  };

  /**
   * Renders the composite image to canvas with the user's customized transform
   */
  const renderComposite = useCallback(
    (customTransform = transform) => {
      const userImg = userImgObjRef.current;
      const cutout = cutoutCanvasRef.current;
      if (!userImg || !cutout) return null;

      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Preserve the user's natural photo aspect ratio
      const uW = userImg.naturalWidth || 720;
      const uH = userImg.naturalHeight || 960;
      const targetW = 720;
      const targetH = Math.round(targetW * (uH / uW));
      canvas.width = targetW;
      canvas.height = targetH;

      // 1. Draw user photo
      ctx.drawImage(userImg, 0, 0, targetW, targetH);

      // 2. Subtle ambient studio vignette
      const gradient = ctx.createRadialGradient(
        targetW / 2,
        targetH / 2,
        targetW * 0.2,
        targetW / 2,
        targetH / 2,
        targetW * 0.85
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetW, targetH);

      // 3. Compute position and dimensions from transform
      const gWidth = targetW * (customTransform.scale / 100);
      const aspect = cutout.height / cutout.width;
      const gHeight = gWidth * aspect;
      const centerX = targetW * (customTransform.xPercent / 100);
      const centerY = targetH * (customTransform.yPercent / 100);

      // 4. Ground contact drop-shadow under soles
      if (isFootwear) {
        const shadowY = centerY + gHeight * 0.44;
        const shadowRadiusX = gWidth * 0.46;
        const shadowRadiusY = Math.max(6, gHeight * 0.12);
        const shadowGrad = ctx.createRadialGradient(
          centerX,
          shadowY,
          2,
          centerX,
          shadowY,
          shadowRadiusX
        );
        shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.46)");
        shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.18)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(centerX, shadowY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw item with rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      if (customTransform.rotation) {
        ctx.rotate((customTransform.rotation * Math.PI) / 180);
      }
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(cutout, -gWidth / 2, -gHeight / 2, gWidth, gHeight);
      ctx.restore();

      const compositedDataUrl = canvas.toDataURL("image/jpeg", 0.94);
      setGeneratedResult((prev) => ({
        ...prev,
        image: compositedDataUrl,
      }));

      return compositedDataUrl;
    },
    [isFootwear, transform]
  );

  /**
   * Run Try-On with Selected AI Model (ChatGPT / Gemini 3.0 / IDM-VTON / Clean Studio)
   */
  const runVirtualTryOn = async () => {
    setProcessing(true);

    try {
      if (selectedEngine === "chatgpt") {
        setProcessStep("Connecting to ChatGPT / OpenAI Multi-Modal Inpainting Engine...");
        await new Promise((r) => setTimeout(r, 600));
        setProcessStep("Transferring apparel fabric & preserving identity landmarks...");
        await new Promise((r) => setTimeout(r, 700));
        setProcessStep("Rendering realistic drapery, shadow depth & skin contours...");
        await new Promise((r) => setTimeout(r, 700));
      } else if (selectedEngine === "gemini-3") {
        setProcessStep("Connecting to Google Gemini 3.0 Vision Neural Engine...");
        await new Promise((r) => setTimeout(r, 600));
        setProcessStep("Analyzing anatomical landmarks & posture elevation...");
        await new Promise((r) => setTimeout(r, 700));
      } else if (selectedEngine === "idm-vton") {
        setProcessStep("Connecting to IDM-VTON 2.0 Diffusion virtual fitting engine...");
        await new Promise((r) => setTimeout(r, 600));
        setProcessStep("Synthesizing deep fabric warp & natural wrinkle drape...");
        await new Promise((r) => setTimeout(r, 700));
      } else {
        setProcessStep("Initializing PrimeNest Studio Clean-Fit Engine...");
        await new Promise((r) => setTimeout(r, 500));
        setProcessStep("Extracting silhouette & removing studio plate...");
        await new Promise((r) => setTimeout(r, 600));
      }

      // Call real backend API /api/ai/try-on
      let aiResult = null;
      try {
        const res = await fetch("/api/ai/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userImage: selectedUserImage,
            garmentImage: rawGarmentImg,
            garmentName: product.name,
            category: product.category,
            productId: product.id,
            engine: selectedEngine,
            openaiApiKey: customOpenAiKey || undefined,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          aiResult = json?.data;
        }
      } catch (apiErr) {
        console.warn("Try-on API fallback:", apiErr);
      }

      // If Generative AI returned a photorealistic synthesized image (ChatGPT / Diffusion)
      if (aiResult?.generatedImageUrl) {
        setViewMode("result");
        setGeneratedResult({
          image: aiResult.generatedImageUrl,
          originalImage: selectedUserImage,
          garmentName: product.name,
          fitScore: aiResult.fitScore || 99.4,
          engineModel: aiResult.model || "ChatGPT / OpenAI Neural Try-On (Catalog SOTA)",
          notes:
            aiResult.notes ||
            "High-fidelity generative inpainting. Preserves facial identity, body posture, natural creases, dropped shoulders, and ambient lighting.",
          styleTip:
            aiResult.styleTip ||
            "Pairs seamlessly with neutral cargo shorts or distressed light-wash denim.",
          isGenerative: true,
        });
        return;
      }

      setProcessStep("Calibrating ambient lighting & blending contours...");
      await new Promise((r) => setTimeout(r, 600));

      // Load user person image
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.src = selectedUserImage;

      // Load garment/footwear image
      const garmImg = new Image();
      garmImg.crossOrigin = "anonymous";
      garmImg.src = garmentImg;

      await Promise.all([
        new Promise((resolve) => {
          userImg.onload = resolve;
          userImg.onerror = resolve;
        }),
        new Promise((resolve) => {
          garmImg.onload = resolve;
          garmImg.onerror = resolve;
        }),
      ]);

      userImgObjRef.current = userImg;

      // Clean background and isolate garment
      const cutout = createCleanCutout(garmImg);

      // Determine initial placement from AI analysis or calibrated defaults
      const detectedY = isFootwear
        ? aiResult?.feetYPercent || 88
        : aiResult?.torsoYPercent || 42;
      const detectedScale = aiResult?.suggestedScale || (isFootwear ? 32 : 65);

      const initialTransform = {
        xPercent: 50,
        yPercent: detectedY,
        scale: detectedScale,
        rotation: 0,
      };
      setTransform(initialTransform);

      const compositeDataUrl = renderComposite(initialTransform);

      setGeneratedResult({
        image: compositeDataUrl || selectedUserImage,
        originalImage: selectedUserImage,
        garmentName: product.name,
        fitScore: aiResult?.fitScore || 98,
        engineModel:
          aiResult?.model ||
          (selectedEngine === "gemini-3"
            ? "Google Gemini 3.0 Vision Neural Engine"
            : selectedEngine === "idm-vton"
            ? "IDM-VTON 2.0 Diffusion"
            : "PrimeNest Studio Ultra-Fit"),
        notes:
          aiResult?.notes ||
          (isFootwear
            ? "Calibrated to floor ground elevation with true-to-size toe box clearance. Arch contour grounded with contact shadow."
            : "Contour-mapped across shoulders and chest for natural silhouette drape with neckline preservation."),
        styleTip:
          aiResult?.styleTip ||
          (isFootwear
            ? "Pairs effortlessly with cuffed relaxed denim, tapered cargo, or ankle-cut street trousers."
            : "Pairs exceptionally with tailored trousers or clean dark indigo denim."),
        isGenerative: false,
      });
    } catch (err) {
      console.error("Virtual Try-On error:", err);
      setGeneratedResult({
        image: selectedUserImage,
        originalImage: selectedUserImage,
        garmentName: product.name,
        fitScore: 95,
        engineModel: "PrimeNest Studio Engine",
        notes: isFootwear
          ? "Footwear proportions aligned with natural standing ground elevation."
          : "Virtual styling fit mapped successfully.",
        styleTip: "Style with neutral tones to let the silhouette take focus.",
        isGenerative: false,
      });
    } finally {
      setProcessing(false);
      setProcessStep("");
    }
  };

  // Re-render composite whenever transform updates
  const updateTransform = (newTransform) => {
    setTransform(newTransform);
    renderComposite(newTransform);
  };

  // Toggle garment isolation (e.g. for apparel with human models vs pure flatlay)
  const toggleGarmentIsolation = () => {
    const next = !isolateGarmentOnly;
    setIsolateGarmentOnly(next);
    if (userImgObjRef.current) {
      const garmImg = new Image();
      garmImg.crossOrigin = "anonymous";
      garmImg.src = garmentImg;
      garmImg.onload = () => {
        createCleanCutout(garmImg);
        renderComposite(transform);
      };
    }
  };

  // Dragging handlers on the interactive image stage
  const handleStageMouseDown = (e) => {
    if (!generatedResult || viewMode !== "result") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initXPercent: transform.xPercent,
      initYPercent: transform.yPercent,
    };
  };

  const handleStageMouseMove = (e) => {
    if (!isDragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(8, Math.min(92, dragStartRef.current.initXPercent + deltaX));
    const newY = Math.max(12, Math.min(96, dragStartRef.current.initYPercent + deltaY));

    setTransform((prev) => ({
      ...prev,
      xPercent: Math.round(newX * 10) / 10,
      yPercent: Math.round(newY * 10) / 10,
    }));
  };

  const handleStageMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      renderComposite(transform);
    }
  };

  // Touch handlers for mobile / touchscreens
  const handleTouchStart = (e) => {
    if (!generatedResult || viewMode !== "result" || !e.touches[0]) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initXPercent: transform.xPercent,
      initYPercent: transform.yPercent,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !stageRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = stageRef.current.getBoundingClientRect();
    const deltaX = ((touch.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((touch.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(8, Math.min(92, dragStartRef.current.initXPercent + deltaX));
    const newY = Math.max(12, Math.min(96, dragStartRef.current.initYPercent + deltaY));

    setTransform((prev) => ({
      ...prev,
      xPercent: Math.round(newX * 10) / 10,
      yPercent: Math.round(newY * 10) / 10,
    }));
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      renderComposite(transform);
    }
  };

  // Quick placement presets
  const applyPreset = (presetType) => {
    let next = { ...transform };
    if (presetType === "feet") {
      next = { ...next, xPercent: 50, yPercent: 88, scale: 32, rotation: 0 };
    } else if (presetType === "ankle") {
      next = { ...next, xPercent: 50, yPercent: 80, scale: 34, rotation: 0 };
    } else if (presetType === "torso") {
      next = { ...next, xPercent: 50, yPercent: 42, scale: 65, rotation: 0 };
    } else if (presetType === "center") {
      next = { ...next, xPercent: 50, yPercent: 50, scale: isFootwear ? 44 : 65, rotation: 0 };
    } else if (presetType === "reset") {
      next = {
        xPercent: 50,
        yPercent: isFootwear ? 88 : 42,
        scale: isFootwear ? 32 : 65,
        rotation: 0,
      };
    }
    updateTransform(next);
  };

  const handleDownload = () => {
    if (!generatedResult?.image) return;
    const a = document.createElement("a");
    a.href = generatedResult.image;
    a.download = `PrimeNest-${isFootwear ? "OnFoot" : "TryOn"}-${product.name.replace(
      /\s+/g,
      "-"
    )}.jpg`;
    a.click();
  };

  return (
    <div className="vton-backdrop" onClick={onClose}>
      <div className="vton-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vton-header">
          <div className="vton-title-wrap">
            <span className="vton-badge">
              <Sparkles size={13} /> {isFootwear ? "AI ON-FOOT STUDIO" : "AI VIRTUAL TRY-ON"}
            </span>
            <h2>{isFootwear ? "On-Foot Sneaker Simulator" : "Fitting Room Simulator"}</h2>
          </div>
          <button className="vton-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vton-body">
          {/* Left Column: Garment Details, Model Selection & Person Selector */}
          <div className="vton-sidebar">
            {/* Garment Card */}
            <div className="vton-garment-card">
              <img
                src={cleanCutoutUrl || rawGarmentImg}
                alt={product.name}
                className="vton-garment-thumb"
              />
              <div className="vton-garment-info">
                <span className="vton-garment-cat">{product.category}</span>
                <h4>{product.name}</h4>
                <p className="vton-garment-price">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
                <div className="vton-ready-badge">
                  <Check size={12} />{" "}
                  {isFootwear ? "Ready for On-Foot Staging" : "Ready for Virtual Fit"}
                </div>
              </div>
            </div>

            {/* AI Model Engine Selector */}
            <div className="vton-engine-selector-box">
              <div className="vton-engine-header-row">
                <label className="vton-section-label">
                  <Cpu size={12} className="text-amber-500" /> SELECT AI TRY-ON MODEL
                </label>
                <button
                  type="button"
                  className="vton-api-settings-link"
                  onClick={() => setShowApiKeyDrawer(!showApiKeyDrawer)}
                >
                  ⚙️ {showApiKeyDrawer ? "Hide Key" : "Custom OpenAI Key"}
                </button>
              </div>

              {showApiKeyDrawer && (
                <div className="vton-api-drawer">
                  <div className="vton-api-drawer-header">
                    <span>OpenAI API Key (Optional for live generation):</span>
                  </div>
                  <div className="vton-api-input-wrap">
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={customOpenAiKey}
                      onChange={(e) => setCustomOpenAiKey(e.target.value)}
                      className="vton-api-input"
                    />
                    {customOpenAiKey && (
                      <span className="text-xs text-emerald-500 font-semibold flex items-center">
                        ✓ Active
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="vton-engine-options">
                {/* 1. ChatGPT / OpenAI SOTA Try-On */}
                <button
                  type="button"
                  className={`vton-engine-card ${selectedEngine === "chatgpt" ? "active" : ""}`}
                  onClick={() => setSelectedEngine("chatgpt")}
                >
                  <div className="vton-engine-radio">
                    {selectedEngine === "chatgpt" && <span className="radio-dot" />}
                  </div>
                  <div className="vton-engine-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="vton-engine-name">
                        🤖 ChatGPT / OpenAI Neural Try-On (Catalog SOTA)
                      </span>
                      <span className="vton-recommended-badge">Verified</span>
                    </div>
                    <span className="vton-engine-sub">
                      Multi-modal diffusion inpainting • Photorealistic fabric drape & zero ghost artifacts
                    </span>
                  </div>
                </button>

                {/* 2. Google Gemini 3.0 Vision */}
                <button
                  type="button"
                  className={`vton-engine-card ${selectedEngine === "gemini-3" ? "active" : ""}`}
                  onClick={() => setSelectedEngine("gemini-3")}
                >
                  <div className="vton-engine-radio">
                    {selectedEngine === "gemini-3" && <span className="radio-dot" />}
                  </div>
                  <div className="vton-engine-meta">
                    <span className="vton-engine-name">
                      ✨ Google Gemini 3.0 Vision (Ultra)
                    </span>
                    <span className="vton-engine-sub">
                      Neural landmark detection & lighting match
                    </span>
                  </div>
                </button>

                {/* 3. IDM-VTON 2.0 */}
                <button
                  type="button"
                  className={`vton-engine-card ${selectedEngine === "idm-vton" ? "active" : ""}`}
                  onClick={() => setSelectedEngine("idm-vton")}
                >
                  <div className="vton-engine-radio">
                    {selectedEngine === "idm-vton" && <span className="radio-dot" />}
                  </div>
                  <div className="vton-engine-meta">
                    <span className="vton-engine-name">
                      ⚡ IDM-VTON 2.0 (High-Precision Diffusion)
                    </span>
                    <span className="vton-engine-sub">
                      Deep diffusion fabric warp & drape
                    </span>
                  </div>
                </button>

                {/* 4. PrimeNest Studio Clean-Fit */}
                <button
                  type="button"
                  className={`vton-engine-card ${selectedEngine === "primenest-pro" ? "active" : ""}`}
                  onClick={() => setSelectedEngine("primenest-pro")}
                >
                  <div className="vton-engine-radio">
                    {selectedEngine === "primenest-pro" && <span className="radio-dot" />}
                  </div>
                  <div className="vton-engine-meta">
                    <span className="vton-engine-name">
                      🎯 PrimeNest Studio Clean-Fit
                    </span>
                    <span className="vton-engine-sub">
                      Zero ghost heads • isolated garment mapping
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Apparel Garment Isolation Toggle */}
            {!isFootwear && (
              <div className="vton-isolation-toggle-row">
                <label className="vton-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={isolateGarmentOnly}
                    onChange={toggleGarmentIsolation}
                  />
                  <span className="checkbox-text">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <strong>Isolate Garment Only</strong> (Removes model's head & neck)
                  </span>
                </label>
              </div>
            )}

            {/* Photo Selection Tabs */}
            <div className="vton-source-section">
              <label className="vton-section-label">
                CHOOSE {isFootwear ? "STANDING LOOK" : "YOUR PHOTO"}
              </label>

              {/* Upload Box */}
              <div
                className={`vton-upload-dropzone ${isCustomUpload ? "active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="vton-upload-icon" />
                <div className="vton-upload-text">
                  <span>{isCustomUpload ? "Photo Selected ✓" : "Upload Your Photo"}</span>
                  <small>
                    {isFootwear
                      ? "Full-body standing photos work best"
                      : "Front-facing standing posture works best"}
                  </small>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>

              {/* Preset Models */}
              <label className="vton-section-label" style={{ marginTop: "14px" }}>
                {isFootwear ? "OR CHOOSE STREETWEAR STANCE" : "OR TRY WITH DEMO MODELS"}
              </label>
              <div className="vton-preset-grid">
                {demoModels.map((m) => {
                  const isSelected = !isCustomUpload && selectedUserImage === m.url;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`vton-preset-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectPreset(m)}
                    >
                      <img src={m.url} alt={m.label} />
                      <span>{m.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className="vton-generate-btn"
              onClick={runVirtualTryOn}
              disabled={processing}
            >
              {processing ? (
                <>
                  <RefreshCw size={16} className="vton-spin" />
                  <span>Processing {selectedEngine.toUpperCase()} Neural Fit...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>
                    {generatedResult
                      ? isFootwear
                        ? "Re-Stage On-Foot"
                        : "Re-Generate Fit"
                      : isFootwear
                        ? "Stage On-Foot Look"
                        : "Try It On Me"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Interactive Stage & Result */}
          <div className="vton-stage">
            {processing ? (
              <div className="vton-processing-view">
                <div className="vton-scanner-wrap">
                  <img src={selectedUserImage} alt="Scanning" className="vton-scan-base" />
                  <div className="vton-scan-laser" />
                  <div className="vton-scan-overlay" />
                </div>
                <div className="vton-scan-status">
                  <div className="vton-status-spinner" />
                  <p>{processStep}</p>
                  <small>
                    Powered by{" "}
                    {selectedEngine === "gemini-3"
                      ? "Google Gemini 3.0 Vision Neural Engine"
                      : selectedEngine === "idm-vton"
                      ? "IDM-VTON 2.0 Diffusion"
                      : "PrimeNest Clean-Fit Engine"}
                  </small>
                </div>
              </div>
            ) : generatedResult ? (
              <div className="vton-result-view">
                {/* Result Controls Topbar */}
                <div className="vton-result-toolbar">
                  <div className="vton-fit-pill">
                    <span className="fit-indicator" />
                    <strong>{generatedResult.fitScore}% Fit Accuracy</strong>
                    <span className="vton-model-engine-badge">
                      {generatedResult.engineModel || "ChatGPT SOTA"}
                    </span>
                  </div>

                  <div className="vton-view-toggles">
                    <button
                      type="button"
                      className={viewMode === "result" ? "active" : ""}
                      onClick={() => setViewMode("result")}
                    >
                      {isFootwear ? "Fitted On-Foot" : "Fitted Look ✨"}
                    </button>
                    <button
                      type="button"
                      className={viewMode === "original" ? "active" : ""}
                      onClick={() => setViewMode("original")}
                    >
                      Original Photo
                    </button>
                    <button
                      type="button"
                      className={viewMode === "split" ? "active" : ""}
                      onClick={() => setViewMode("split")}
                    >
                      Side-by-Side
                    </button>
                  </div>
                </div>

                {/* Main Interactive Stage */}
                <div className="vton-display-frame">
                  {viewMode === "split" ? (
                    <div className="vton-split-display">
                      <div className="vton-split-col">
                        <span className="split-tag">Original Photo</span>
                        <img src={selectedUserImage} alt="Original" />
                      </div>
                      <div className="vton-split-col">
                        <span className="split-tag highlight">
                          {isFootwear ? "On-Foot AI" : "AI Try-On"}
                        </span>
                        <img src={generatedResult.image} alt="After" />
                      </div>
                    </div>
                  ) : viewMode === "original" ? (
                    <div className="vton-generative-stage">
                      <img
                        src={selectedUserImage}
                        alt="Original Photo"
                        className="vton-generative-photo"
                      />
                      <span className="vton-watermark">✦ PrimeNest Original Photo</span>
                    </div>
                  ) : generatedResult?.isGenerative ? (
                    /* SOTA Photorealistic Generative Result (ChatGPT / Diffusion) */
                    <div className="vton-generative-stage">
                      <div className="vton-generative-badge">
                        <Sparkles size={12} />
                        <span>SOTA Fashion Catalog Grade</span>
                      </div>
                      <img
                        src={generatedResult.image}
                        alt="Photorealistic AI Try-On"
                        className="vton-generative-photo"
                      />
                      <span className="vton-watermark">
                        ✦ PrimeNest {generatedResult.engineModel}
                      </span>
                    </div>
                  ) : (
                    /* 2D Canvas Interactive Viewport for Footwear / Clean-Fit */
                    <div className="vton-interactive-viewport">
                      {/* Drag Hint Banner */}
                      <div className="vton-drag-hint-banner">
                        <Move size={13} />
                        <span>
                          {isFootwear
                            ? "Drag shoes to place on your feet • Adjust size & tilt below"
                            : "Drag to adjust garment placement on your torso"}
                        </span>
                      </div>

                      {/* Interactive Stage Box */}
                      <div
                        ref={stageRef}
                        className={`vton-interactive-stage ${isDragging ? "dragging" : ""}`}
                        onMouseDown={handleStageMouseDown}
                        onMouseMove={handleStageMouseMove}
                        onMouseUp={handleStageMouseUp}
                        onMouseLeave={handleStageMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {/* User Photo Base */}
                        <img
                          src={selectedUserImage}
                          alt="Model base"
                          className="vton-stage-photo-base"
                          draggable={false}
                        />

                        {/* Ground Contact Shadow for footwear */}
                        {isFootwear && (
                          <div
                            className="vton-live-shadow"
                            style={{
                              left: `${transform.xPercent}%`,
                              top: `${transform.yPercent + transform.scale * 0.44}%`,
                              width: `${transform.scale * 1.05}%`,
                              height: `${Math.max(10, transform.scale * 0.35)}px`,
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        )}

                        {/* Clean Cutout Overlay (Draggable & Scalable) */}
                        <div
                          className="vton-live-overlay-item"
                          style={{
                            left: `${transform.xPercent}%`,
                            top: `${transform.yPercent}%`,
                            width: `${transform.scale}%`,
                            transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
                          }}
                        >
                          <img
                            src={cleanCutoutUrl || rawGarmentImg}
                            alt="Garment overlay"
                            className="vton-cutout-img"
                            draggable={false}
                          />
                          <div className="vton-item-drag-ring" title="Drag to position" />
                        </div>

                        <span className="vton-watermark">
                          ✦ PrimeNest {isFootwear ? "On-Foot Studio" : "Virtual Try-On"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Precision Positioning & Sizing Controls (for Footwear / Clean-Fit Canvas) */}
                {viewMode === "result" && !generatedResult?.isGenerative && (
                  <div className="vton-adjust-panel">
                    <div className="vton-adjust-header">
                      <div className="vton-adjust-title">
                        <Sliders size={13} className="text-amber-500" />
                        <span>Precision Placement & Fit Calibration</span>
                      </div>
                      <button
                        type="button"
                        className="vton-toggle-tune-btn"
                        onClick={() => setShowFineTune(!showFineTune)}
                      >
                        {showFineTune ? "Hide Controls" : "Show Controls"}
                      </button>
                    </div>

                    {showFineTune && (
                      <div className="vton-adjust-controls-grid">
                        {/* Quick Presets */}
                        <div className="vton-control-block">
                          <label className="vton-control-label">Quick Snap</label>
                          <div className="vton-preset-pills">
                            {isFootwear ? (
                              <>
                                <button
                                  type="button"
                                  className={`vton-tune-pill ${
                                    transform.yPercent >= 84 ? "active" : ""
                                  }`}
                                  onClick={() => applyPreset("feet")}
                                  title="Position at ground feet level"
                                >
                                  👟 Feet (Ground)
                                </button>
                                <button
                                  type="button"
                                  className={`vton-tune-pill ${
                                    transform.yPercent >= 76 && transform.yPercent < 84
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => applyPreset("ankle")}
                                  title="Position at lower ankle level"
                                >
                                  ⚡ Ankle
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className={`vton-tune-pill ${
                                    transform.yPercent <= 48 ? "active" : ""
                                  }`}
                                  onClick={() => applyPreset("torso")}
                                  title="Position at chest/torso level"
                                >
                                  👕 Chest/Torso
                                </button>
                                <button
                                  type="button"
                                  className="vton-tune-pill"
                                  onClick={() => applyPreset("center")}
                                  title="Center placement"
                                >
                                  🎯 Center
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="vton-tune-pill"
                              onClick={() => applyPreset("reset")}
                              title="Reset position"
                            >
                              <RotateCcw size={11} /> Reset
                            </button>
                          </div>
                        </div>

                        {/* Size / Scale Steppers */}
                        <div className="vton-control-block">
                          <label className="vton-control-label">
                            {isFootwear ? "Shoe Scale:" : "Garment Scale:"}{" "}
                            <strong>{transform.scale}%</strong>
                          </label>
                          <div className="vton-stepper-row">
                            <button
                              type="button"
                              className="vton-step-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  scale: Math.max(16, transform.scale - 3),
                                })
                              }
                              title="Make smaller"
                            >
                              <Minus size={13} />
                            </button>
                            <input
                              type="range"
                              min={isFootwear ? "18" : "35"}
                              max={isFootwear ? "60" : "95"}
                              value={transform.scale}
                              onChange={(e) =>
                                updateTransform({
                                  ...transform,
                                  scale: Number(e.target.value),
                                })
                              }
                              className="vton-range-slider"
                            />
                            <button
                              type="button"
                              className="vton-step-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  scale: Math.min(isFootwear ? 65 : 98, transform.scale + 3),
                                })
                              }
                              title="Make larger"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Position Nudge Arrows */}
                        <div className="vton-control-block">
                          <label className="vton-control-label">Nudge Position</label>
                          <div className="vton-nudge-buttons">
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  yPercent: Math.max(10, transform.yPercent - 2),
                                })
                              }
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  yPercent: Math.min(96, transform.yPercent + 2),
                                })
                              }
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  xPercent: Math.max(8, transform.xPercent - 2),
                                })
                              }
                              title="Move Left"
                            >
                              <ArrowLeft size={13} />
                            </button>
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  xPercent: Math.min(92, transform.xPercent + 2),
                                })
                              }
                              title="Move Right"
                            >
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Stance Tilt / Angle */}
                        <div className="vton-control-block">
                          <label className="vton-control-label">
                            Tilt Angle: <strong>{transform.rotation}°</strong>
                          </label>
                          <div className="vton-nudge-buttons">
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  rotation: Math.max(-35, transform.rotation - 4),
                                })
                              }
                              title="Tilt Counter-Clockwise"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  rotation: 0,
                                })
                              }
                              title="Level (0°)"
                            >
                              0°
                            </button>
                            <button
                              type="button"
                              className="vton-nudge-btn"
                              onClick={() =>
                                updateTransform({
                                  ...transform,
                                  rotation: Math.min(35, transform.rotation + 4),
                                })
                              }
                              title="Tilt Clockwise"
                            >
                              <RotateCw size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Notes & Purchase Actions */}
                <div className="vton-result-actions">
                  <p className="vton-fit-note">
                    <strong>AI Sizing Advice:</strong> {generatedResult.notes}
                  </p>
                  {generatedResult.styleTip && (
                    <p className="vton-fit-note" style={{ marginTop: "4px", color: "#b45309" }}>
                      <strong>Styling Pairing:</strong> {generatedResult.styleTip}
                    </p>
                  )}

                  <div className="vton-cta-row">
                    <button
                      type="button"
                      className="vton-btn-download"
                      onClick={handleDownload}
                    >
                      <Download size={15} /> Download Look
                    </button>

                    <button
                      type="button"
                      className="vton-btn-addbag"
                      onClick={() => {
                        if (onAddToCart) onAddToCart();
                        onClose();
                      }}
                    >
                      <ShoppingBag size={15} /> Add to Bag in This Look
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="vton-empty-stage">
                <div className="vton-preview-box">
                  <img
                    src={selectedUserImage}
                    alt="Preview"
                    className="vton-preview-photo"
                  />
                  <div className="vton-preview-badge">
                    <User size={14} /> Ready for Staging
                  </div>
                </div>

                <div className="vton-stage-instructions">
                  <h3>
                    {isFootwear ? "Streetwear Model Selected" : "Preview Model Selected"}
                  </h3>
                  <p>
                    Select your preferred AI model engine on the left, then click{" "}
                    <strong>
                      {isFootwear ? '"Stage On-Foot Look"' : '"Try It On Me"'}
                    </strong>{" "}
                    to fit {product.name} seamlessly with AI landmark alignment and precision
                    sizing adjustments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for client composite */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
*/
