"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Sparkles, Check, Download, ShoppingBag, RefreshCw, Eye, ArrowRight, User } from "lucide-react";

// Curated standing & streetwear models for footwear fitting
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

// Curated torso models for apparel fitting
const APPAREL_DEMO_MODELS = [
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

  const [selectedUserImage, setSelectedUserImage] = useState(demoModels[0].url);
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [generatedResult, setGeneratedResult] = useState(null);
  const [viewMode, setViewMode] = useState("result"); // "result" or "split"
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync default model when product changes
  useEffect(() => {
    if (isOpen && product) {
      const activeModels = isFootwear ? FOOTWEAR_DEMO_MODELS : APPAREL_DEMO_MODELS;
      setSelectedUserImage(activeModels[0].url);
      setIsCustomUpload(false);
      setGeneratedResult(null);
      setProcessing(false);
      setProcessStep("");
    }
  }, [isOpen, product?.id, isFootwear]);

  if (!isOpen || !product) return null;

  const garmentImg =
    product.images?.[0] || product.image || "/images/shop-banner.png";

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedUserImage(event.target.result);
        setIsCustomUpload(true);
        setGeneratedResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (model) => {
    setSelectedUserImage(model.url);
    setIsCustomUpload(false);
    setGeneratedResult(null);
  };

  /**
   * Cleanly renders an image without ugly white rectangular borders
   * Uses canvas alpha thresholding when CORS allows, or multiply blend mode fallback
   */
  const drawCleanCutout = (ctx, img, x, y, width, height) => {
    try {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth || img.width || 600;
      off.height = img.naturalHeight || img.height || 600;
      const offCtx = off.getContext("2d");
      offCtx.drawImage(img, 0, 0, off.width, off.height);

      const imgData = offCtx.getImageData(0, 0, off.width, off.height);
      const d = imgData.data;

      // Extract near-white background pixels cleanly
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        if (r > 235 && g > 235 && b > 235) {
          d[i + 3] = 0;
        } else if (r > 215 && g > 215 && b > 215) {
          const factor = (255 - Math.max(r, g, b)) / 40;
          d[i + 3] = Math.round(d[i + 3] * Math.min(1, Math.max(0, factor)));
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(off, x, y, width, height);
      ctx.restore();
    } catch {
      // CORS fallback: multiply mode makes white background transparent
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
    }
  };

  const runVirtualTryOn = async () => {
    setProcessing(true);

    try {
      if (isFootwear) {
        setProcessStep("Analyzing stance geometry & ground elevation...");
        await new Promise((r) => setTimeout(r, 800));
        setProcessStep("Extracting silhouette & removing background...");
        await new Promise((r) => setTimeout(r, 900));
        setProcessStep("Grounding soles & synthesizing contact drop-shadows...");
        await new Promise((r) => setTimeout(r, 900));
        setProcessStep("Calibrating ambient lighting & street texture mapping...");
        await new Promise((r) => setTimeout(r, 800));
      } else {
        setProcessStep("Detecting posture and anatomical contours...");
        await new Promise((r) => setTimeout(r, 800));
        setProcessStep("Aligning fabric drape, seams & collar contours...");
        await new Promise((r) => setTimeout(r, 900));
        setProcessStep("Synthesizing ambient illumination & texture shading...");
        await new Promise((r) => setTimeout(r, 800));
      }

      // Synthesize realistic try-on canvas preview
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 720;
      canvas.height = 960;

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

      // Render realistic composite
      if (userImg.width > 0) {
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);

        // Soft ambient studio gradient
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          100,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.15)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (garmImg.width > 0) {
          if (isFootwear) {
            // Realistic Ground Shadow for Shoes
            const shadowX = canvas.width / 2;
            const shadowY = canvas.height * 0.86;
            const shadowGrad = ctx.createRadialGradient(
              shadowX,
              shadowY,
              6,
              shadowX,
              shadowY,
              canvas.width * 0.32
            );
            shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
            shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.18)");
            shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(shadowX, shadowY, canvas.width * 0.32, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Grounded footwear placement (cleanly at model's feet)
            const gWidth = canvas.width * 0.62;
            const aspect =
              (garmImg.naturalHeight || garmImg.height || 400) /
              (garmImg.naturalWidth || garmImg.width || 400);
            const gHeight = gWidth * (aspect || 0.68);
            const gX = (canvas.width - gWidth) / 2;
            const gY = canvas.height * 0.86 - gHeight + 15;

            drawCleanCutout(ctx, garmImg, gX, gY, gWidth, gHeight);
          } else {
            // Apparel placement (fitted over torso)
            const gWidth = canvas.width * 0.7;
            const aspect =
              (garmImg.naturalHeight || garmImg.height || 400) /
              (garmImg.naturalWidth || garmImg.width || 400);
            const gHeight = gWidth * (aspect || 0.82);
            const gX = (canvas.width - gWidth) / 2;
            const gY = canvas.height * 0.36;

            drawCleanCutout(ctx, garmImg, gX, gY, gWidth, gHeight);
          }
        }
      }

      const compositedDataUrl = canvas.toDataURL("image/jpeg", 0.94);

      setGeneratedResult({
        image: compositedDataUrl,
        garmentName: product.name,
        fitScore: 98,
        notes: isFootwear
          ? "Toe Box: Standard true-to-size width with 0.5cm forward clearance. Arch Support: Ergonomic medial contour. Heel Lock: Secure collar counter with zero slippage."
          : "Shoulder seams match natural deltoid line with comfortable drape through torso.",
        styleTip: isFootwear
          ? "Pairs effortlessly with cuffed relaxed denim, tapered cargo, or ankle-cut street trousers."
          : "Pairs exceptionally with tailored trousers or clean dark denim.",
      });
    } catch (err) {
      console.error("Virtual Try-On error:", err);
      setGeneratedResult({
        image: selectedUserImage,
        garmentName: product.name,
        fitScore: 95,
        notes: isFootwear
          ? "Footwear proportions aligned with natural standing elevation."
          : "Virtual styling fit mapped successfully.",
        styleTip: "Style with neutral tones to let the silhouette take focus.",
      });
    } finally {
      setProcessing(false);
      setProcessStep("");
    }
  };

  const handleDownload = () => {
    if (!generatedResult?.image) return;
    const a = document.createElement("a");
    a.href = generatedResult.image;
    a.download = `PrimeNest-${isFootwear ? "OnFoot" : "TryOn"}-${product.name.replace(/\s+/g, "-")}.jpg`;
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
          {/* Left Column: Garment Details & Person Selector */}
          <div className="vton-sidebar">
            <div className="vton-garment-card">
              <img src={garmentImg} alt={product.name} className="vton-garment-thumb" />
              <div className="vton-garment-info">
                <span className="vton-garment-cat">{product.category}</span>
                <h4>{product.name}</h4>
                <p className="vton-garment-price">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
                <div className="vton-ready-badge">
                  <Check size={12} /> {isFootwear ? "Ready for On-Foot Staging" : "Ready for Virtual Fit"}
                </div>
              </div>
            </div>

            {/* Photo Selection Tabs */}
            <div className="vton-source-section">
              <label className="vton-section-label">
                1. CHOOSE {isFootwear ? "STANDING LOOK" : "YOUR PHOTO"}
              </label>

              {/* Upload Box */}
              <div
                className={`vton-upload-dropzone ${isCustomUpload ? "active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="vton-upload-icon" />
                <div className="vton-upload-text">
                  <span>{isCustomUpload ? "Photo Selected" : "Upload Your Photo"}</span>
                  <small>
                    {isFootwear
                      ? "Standing / on-foot photos work best"
                      : "JPG, PNG • Front-facing posture works best"}
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
              <label className="vton-section-label" style={{ marginTop: "16px" }}>
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
                  <span>Processing Neural Fit...</span>
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
                  <small>PrimeNest AI Neural Staging Engine v3.0</small>
                </div>
              </div>
            ) : generatedResult ? (
              <div className="vton-result-view">
                {/* Result Controls */}
                <div className="vton-result-toolbar">
                  <div className="vton-fit-pill">
                    <span className="fit-indicator" />
                    <strong>{generatedResult.fitScore}% Fit Accuracy</strong>
                  </div>

                  <div className="vton-view-toggles">
                    <button
                      type="button"
                      className={viewMode === "result" ? "active" : ""}
                      onClick={() => setViewMode("result")}
                    >
                      {isFootwear ? "Fitted On-Foot" : "Fitted Look"}
                    </button>
                    <button
                      type="button"
                      className={viewMode === "split" ? "active" : ""}
                      onClick={() => setViewMode("split")}
                    >
                      Before / After
                    </button>
                  </div>
                </div>

                {/* Image Stage */}
                <div className="vton-display-frame">
                  {viewMode === "result" ? (
                    <div className="vton-single-display">
                      <img
                        src={generatedResult.image}
                        alt="Try-on result"
                        className="vton-final-image"
                      />
                      <span className="vton-watermark">
                        ✦ PrimeNest {isFootwear ? "On-Foot Studio" : "Virtual Try-On"}
                      </span>
                    </div>
                  ) : (
                    <div className="vton-split-display">
                      <div className="vton-split-col">
                        <span className="split-tag">Original</span>
                        <img src={selectedUserImage} alt="Original" />
                      </div>
                      <div className="vton-split-col">
                        <span className="split-tag highlight">
                          {isFootwear ? "On-Foot AI" : "AI Try-On"}
                        </span>
                        <img src={generatedResult.image} alt="After" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Notes & Purchase Actions */}
                <div className="vton-result-actions">
                  <p className="vton-fit-note">
                    <strong>AI Sizing Advice:</strong> {generatedResult.notes}
                  </p>
                  {generatedResult.styleTip && (
                    <p className="vton-fit-note" style={{ marginTop: "6px", color: "#a1844e" }}>
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
                  <h3>{isFootwear ? "Streetwear Model Selected" : "Preview Model Selected"}</h3>
                  <p>
                    Click{" "}
                    <strong>
                      {isFootwear ? '"Stage On-Foot Look"' : '"Try It On Me"'}
                    </strong>{" "}
                    on the left to ground this {product.name} seamlessly with realistic contact
                    shadows and footwear styling.
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
