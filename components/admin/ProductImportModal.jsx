"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Loader2,
} from "lucide-react";

// Sample rows used for generating templates with all 5 product image slots & slug
// Sample rows matching 100% same to same with the "Add New Product" admin form
const SAMPLE_DATA = [
  {
    "Product Title": "Men Relaxed Fit Cotton Mustard Printed Polo T-shirt",
    "Product Slug": "men-relaxed-fit-cotton-mustard-printed-polo-t-shirt",
    "Description": "The Puma Men's Relaxed Fit Cotton Mustard Printed Polo T-Shirt is an energetic, sport-infused casual classic crafted from 100% breathable pure cotton knit fabric, offering a soft hand-feel, dependable sweat absorption, and comfortable drape for all-day wear.",
    "Price (₹ INR)": 1196.00,
    "Stock Units": 50,
    "Category": "Men",
    "Subcategory": "Polo T-Shirts",
    "Primary Cover Image (Front View)": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 2": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 3": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 4": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 5": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  },
  {
    "Product Title": "Floral Bohemian Tiered Maxi Dress",
    "Product Slug": "floral-bohemian-tiered-maxi-dress",
    "Description": "Elegant flowy maxi dress featuring artisanal floral motifs, lightweight breathable fabric, and flared silhouette.",
    "Price (₹ INR)": 2499.00,
    "Stock Units": 25,
    "Category": "Women",
    "Subcategory": "Dresses",
    "Primary Cover Image (Front View)": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 2": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 3": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 4": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 5": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    "Product Title": "Urban Minimalist White Leather Sneakers",
    "Product Slug": "urban-minimalist-white-leather-sneakers",
    "Description": "Handcrafted monochrome sneakers with plush memory foam insole and durable vulcanized rubber soles.",
    "Price (₹ INR)": 3299.00,
    "Stock Units": 30,
    "Category": "Footwear",
    "Subcategory": "Men's Sneakers",
    "Primary Cover Image (Front View)": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 2": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 3": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 4": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 5": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    "Product Title": "Velvet Noir Eau De Parfum 100ml",
    "Product Slug": "velvet-noir-eau-de-parfum-100ml",
    "Description": "Captivating artisanal fragrance opening with rich bergamot, smoldering amber wood, and spiced vanilla.",
    "Price (₹ INR)": 2899.00,
    "Stock Units": 50,
    "Category": "Perfume",
    "Subcategory": "Unisex Perfume",
    "Primary Cover Image (Front View)": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 2": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 3": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 4": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80",
    "Gallery Angle Image 5": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
  }
];

// Helper to download sample CSV template matching 100% same to same with Add Product UI
export function downloadSampleCsv() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "primenest_products_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Sample CSV template downloaded with exact matching form fields!");
}

// Helper to download sample Excel (.xlsx) template matching 100% same to same with Add Product UI
export function downloadSampleExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA);

  // Set column widths matching all fields
  ws["!cols"] = [
    { wch: 42 }, // Product Title
    { wch: 38 }, // Product Slug
    { wch: 55 }, // Description
    { wch: 16 }, // Price (₹ INR)
    { wch: 14 }, // Stock Units
    { wch: 16 }, // Category
    { wch: 20 }, // Subcategory
    { wch: 50 }, // Primary Cover Image (Front View)
    { wch: 50 }, // Gallery Angle Image 2
    { wch: 50 }, // Gallery Angle Image 3
    { wch: 50 }, // Gallery Angle Image 4
    { wch: 50 }, // Gallery Angle Image 5
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Products Catalog");
  XLSX.writeFile(wb, "primenest_products_template.xlsx");
  toast.success("Sample Excel (.xlsx) template downloaded with exact matching form fields!");
}

// Smart sheet extractor: detects true header row even with leading empty rows or title banners
export function extractSheetRows(sheet) {
  if (!sheet) return [];
  // 1. Convert sheet to 2D grid
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!grid || grid.length === 0) return [];

  const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Keywords that identify a product catalog header row
  const headerKeywords = [
    "title", "product", "name", "price", "mrp", "cost", "stock", "qty",
    "quantity", "category", "image", "cover", "gallery", "angle", "slug", "desc", "sku", "rate", "subcat"
  ];

  let headerRowIndex = 0;
  let maxScore = 0;

  // Scan first 25 rows to identify the actual header row
  const searchLimit = Math.min(grid.length, 25);
  for (let r = 0; r < searchLimit; r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    let score = 0;
    for (const cell of row) {
      const cellClean = clean(cell);
      if (!cellClean) continue;
      for (const kw of headerKeywords) {
        if (cellClean.includes(kw)) {
          score += 2;
          break;
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      headerRowIndex = r;
    }
  }

  const rawHeaders = Array.isArray(grid[headerRowIndex]) ? grid[headerRowIndex] : [];
  const headers = rawHeaders.map((h, i) => {
    const str = String(h || "").trim();
    return str || `col_${i + 1}`;
  });

  const dataRows = [];
  for (let r = headerRowIndex + 1; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    const hasData = row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "");
    if (!hasData) continue;

    const rowObj = {};
    headers.forEach((hdr, colIdx) => {
      rowObj[hdr] = row[colIdx] !== undefined ? row[colIdx] : "";
    });
    dataRows.push(rowObj);
  }

  // Fallback: If 2D extraction found nothing, use standard sheet_to_json
  if (dataRows.length === 0) {
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  return dataRows;
}

export default function ProductImportModal({
  isOpen,
  onClose,
  categories = [],
  onImportSuccess,
}) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      toast.error("Please upload a valid .csv, .xlsx, or .xls file.");
      return;
    }

    setFileName(selectedFile.name);
    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawJson = extractSheetRows(sheet);

        if (!rawJson || rawJson.length === 0) {
          toast.error("Spreadsheet is empty. No valid data rows found.");
          setParsedRows([]);
          return;
        }

        const cleanKey = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        // Normalize each row for preview and validation
        const normalized = rawJson.map((row, idx) => {
          const keys = Object.keys(row);
          const getVal = (...fieldNames) => {
            for (const name of fieldNames) {
              const target = cleanKey(name);
              for (const k of keys) {
                if (cleanKey(k) === target && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
                  return row[k];
                }
              }
            }
            return "";
          };

          let name = String(getVal("name", "title", "producttitle", "productname", "itemname", "item") || "").trim();
          if (!name) {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (
                (ck.includes("title") || (ck.includes("product") && !ck.includes("slug") && !ck.includes("url") && !ck.includes("desc") && !ck.includes("image") && !ck.includes("cat"))) &&
                row[k] !== undefined &&
                row[k] !== null &&
                String(row[k]).trim() !== ""
              ) {
                name = String(row[k]).trim();
                break;
              }
            }
          }
          
          let slug = String(getVal("slug", "productslug") || "").trim();
          if (!slug && name) {
            slug = name
              .toLowerCase()
              .normalize("NFKD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 80);
          }

          const description = String(getVal("description", "desc", "details", "productdescription", "detail") || "").trim();

          // Price extraction: check exact target or any key containing price, mrp, cost, amount, rate
          let priceRaw = getVal("price", "priceinr", "mrp", "cost", "rate", "amount", "unitprice");
          if (priceRaw === "") {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (
                (ck.includes("price") || ck.includes("mrp") || ck.includes("cost") || ck.includes("amount") || ck.includes("rate")) &&
                row[k] !== undefined &&
                row[k] !== null &&
                String(row[k]).trim() !== ""
              ) {
                priceRaw = row[k];
                break;
              }
            }
          }

          let price = null;
          if (typeof priceRaw === "number" && Number.isFinite(priceRaw) && priceRaw > 0) {
            price = priceRaw;
          } else if (priceRaw !== "" && priceRaw !== undefined && priceRaw !== null) {
            const cleanNum = String(priceRaw).replace(/,/g, "").replace(/[^0-9.]/g, "");
            const parsed = parseFloat(cleanNum);
            if (Number.isFinite(parsed) && parsed > 0) {
              price = parsed;
            }
          }

          // Stock extraction
          let stockRaw = getVal("stock", "stockunits", "quantity", "qty", "inventory", "units", "totalunits");
          if (stockRaw === "") {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (
                (ck.includes("stock") || ck.includes("qty") || ck.includes("quantity") || ck.includes("units")) &&
                row[k] !== undefined &&
                row[k] !== null &&
                String(row[k]).trim() !== ""
              ) {
                stockRaw = row[k];
                break;
              }
            }
          }

          let stock = 10;
          if (typeof stockRaw === "number" && Number.isInteger(stockRaw) && stockRaw >= 0) {
            stock = stockRaw;
          } else if (stockRaw !== "" && stockRaw !== undefined && stockRaw !== null) {
            const parsedStock = parseInt(String(stockRaw).replace(/[^0-9]/g, ""), 10);
            if (Number.isInteger(parsedStock) && parsedStock >= 0) {
              stock = parsedStock;
            }
          }

          let categoryRaw = String(getVal("category", "categoryname", "catogary", "catogaryname", "categoryid", "cat") || "").trim();
          if (!categoryRaw) {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (ck.includes("cat") && !ck.includes("sub") && row[k] && String(row[k]).trim() !== "") {
                categoryRaw = String(row[k]).trim();
                break;
              }
            }
          }

          let subcategory = String(getVal("subcategory", "subcategoryname", "subcatogary", "subcatogaryname", "subcat") || "").trim();
          if (!subcategory) {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (ck.includes("subcat") && row[k] && String(row[k]).trim() !== "") {
                subcategory = String(row[k]).trim();
                break;
              }
            }
          }

          // Extract all image links across all columns (supporting 5+ image links)
          const images = [];
          const urlRegex = /(https?:\/\/[^\s"',;<>|]+)/gi;

          // If row.images already exists as an array
          if (Array.isArray(row.images)) {
            for (const u of row.images) {
              if (typeof u === "string" && /^https?:\/\//i.test(u) && !images.includes(u)) {
                images.push(u);
              }
            }
          }

          // 1. Primary/Cover angle first (Slot 1)
          for (const k of keys) {
            const ck = cleanKey(k);
            if (
              ck.includes("primary") ||
              ck.includes("cover") ||
              ck.includes("front") ||
              ck === "url1" ||
              ck === "image1" ||
              ck === "image" ||
              ck === "imageurl" ||
              ck === "photo1"
            ) {
              const matches = String(row[k] || "").match(urlRegex) || [];
              for (const m of matches) {
                if (!images.includes(m)) images.push(m);
              }
            }
          }

          // 2. Angle slots: Gallery Angle Image 2, 3, 4, 5, etc. and URL 2..8
          for (let i = 2; i <= 8; i++) {
            for (const k of keys) {
              const ck = cleanKey(k);
              if (
                ck === `url${i}` ||
                ck === `image${i}` ||
                ck === `image${i}url` ||
                ck === `photo${i}` ||
                ck === `img${i}` ||
                ck === `gallery${i}` ||
                ck.includes(`angleimage${i}`) ||
                ck.includes(`galleryangleimage${i}`) ||
                ck.includes(`galleryangle${i}`) ||
                ck.includes(`angle${i}`) ||
                ck.endsWith(`image${i}`) ||
                ck.endsWith(`${i}`)
              ) {
                const matches = String(row[k] || "").match(urlRegex) || [];
                for (const m of matches) {
                  if (!images.includes(m)) images.push(m);
                }
              }
            }
          }

          // 3. Any other columns mentioning image/gallery/photo (skipping standalone 'url')
          for (const k of keys) {
            const ck = cleanKey(k);
            if (ck === "url" || ck === "producturl" || ck === "link") continue;
            if (
              ck.includes("image") ||
              ck.includes("gallery") ||
              ck.includes("photo") ||
              ck.includes("img") ||
              ck.includes("picture")
            ) {
              const matches = String(row[k] || "").match(urlRegex) || [];
              for (const m of matches) {
                if (!images.includes(m)) images.push(m);
              }
            }
          }

          // 4. Any remaining cells in the row containing http (skipping standalone 'url' column)
          for (const k of keys) {
            const ck = cleanKey(k);
            if (ck === "url" || ck === "producturl" || ck === "link") continue;
            const val = String(row[k] || "");
            if (val.includes("http://") || val.includes("https://")) {
              const matches = val.match(urlRegex) || [];
              for (const m of matches) {
                if (!images.includes(m)) images.push(m);
              }
            }
          }

          const validImages = images.filter((u) => /^https?:\/\//i.test(u));

          const errors = [];
          if (!name) errors.push("Title is required");
          if (!Number.isFinite(price) || price <= 0) errors.push("Price must be > 0");
          if (validImages.length === 0) errors.push("No image links found (recommended)");

          return {
            rowId: idx + 1,
            name,
            slug,
            description,
            price,
            stock,
            category: categoryRaw,
            subcategory,
            images: validImages,
            isValid: Boolean(name && Number.isFinite(price) && price > 0),
            errors,
          };
        });

        setParsedRows(normalized);
        const validCount = normalized.filter((r) => r.isValid).length;
        toast.success(`Loaded ${normalized.length} row(s) from "${selectedFile.name}" (${validCount} valid)`);
      } catch (err) {
        console.error("Failed to parse spreadsheet:", err);
        toast.error("Failed to read spreadsheet file. Please check file format.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleResetFile = () => {
    setFile(null);
    setFileName("");
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      toast.error("No valid product rows to import.");
      return;
    }

    setImporting(true);

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          products: validRows,
          default_category_id: defaultCategory ? Number(defaultCategory) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to import products.");
      }

      setImportResult(data);
      toast.success(data.message || `Successfully imported ${data.importedCount} products!`);
      if (onImportSuccess) {
        await onImportSuccess();
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error(err.message || "Bulk import failed. Please verify spreadsheet contents.");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="saas-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !importing) onClose();
      }}
    >
      <div
        className="saas-modal-card"
        style={{ maxWidth: "860px", width: "95vw" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="saas-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="saas-modal-title" style={{ fontSize: "20px" }}>
                Import Products (CSV / Excel)
              </h2>
              <p className="saas-modal-sub">
                Upload your inventory spreadsheet with product details, pricing, and image links.
              </p>
            </div>
          </div>
          <button
            className="saas-modal-close"
            type="button"
            onClick={onClose}
            disabled={importing}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* View 1: If Import Completed */}
        {importResult ? (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#ecfdf5",
                border: "2px solid #a7f3d0",
                display: "grid",
                placeItems: "center",
                color: "#059669",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
              Import Completed Successfully!
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px" }}>
              Added <strong style={{ color: "#059669" }}>{importResult.importedCount}</strong> new products
              to your live inventory catalog.
            </p>

            {importResult.errors && importResult.errors.length > 0 && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  textAlign: "left",
                  marginBottom: "20px",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "12px", color: "#b45309", marginBottom: "6px" }}>
                  Skipped Rows ({importResult.errors.length}):
                </div>
                {importResult.errors.map((err, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#92400e", marginBottom: "4px" }}>
                    • Row {err.row} ({err.product}): {err.message}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                className="saas-silver-action-btn"
                onClick={handleResetFile}
              >
                Import Another File
              </button>
              <button
                type="button"
                className="saas-btn-primary"
                onClick={onClose}
              >
                Done & View Catalog
              </button>
            </div>
          </div>
        ) : parsedRows.length === 0 ? (
          /* View 2: File Upload & Templates View */
          <div>
            {/* Quick Template Download Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={16} style={{ color: "#2563eb" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                    Need a template to get started?
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                    Download pre-formatted sample files with image link columns ready to fill.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="saas-silver-action-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", padding: "7px 12px" }}
                >
                  <Download size={13} />
                  <span>Sample .CSV</span>
                </button>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="saas-silver-action-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", padding: "7px 12px" }}
                >
                  <Download size={13} />
                  <span>Sample .XLSX</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
                background: isDragging
                  ? "rgba(239, 246, 255, 0.7)"
                  : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "18px",
                padding: "44px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isDragging ? "0 0 0 4px rgba(37, 99, 235, 0.1)" : "none",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: isDragging
                    ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                    : "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
                  color: isDragging ? "#ffffff" : "#475569",
                  border: "1px solid #cbd5e1",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 14px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <Upload size={24} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>
                Drag and drop your CSV or Excel file here
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px" }}>
                or <span style={{ color: "#2563eb", fontWeight: "600", textDecoration: "underline" }}>browse from computer</span>
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                <span className="saas-badge-file">.CSV</span>
                <span className="saas-badge-file">.XLSX</span>
                <span className="saas-badge-file">.XLS</span>
              </div>
            </div>

            {/* Column Guide Cheatsheet */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <HelpCircle size={14} style={{ color: "#64748b" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                  Supported Columns Reference:
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "10px",
                }}
              >
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Product Title *</span>
                  <span className="saas-col-sub">Item name (e.g. Polo T-shirt)</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Product Slug *</span>
                  <span className="saas-col-sub">Unique URL handle</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Description</span>
                  <span className="saas-col-sub">Specs & fabric details</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Price (₹ INR) *</span>
                  <span className="saas-col-sub">e.g. 1196.00</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Stock Units *</span>
                  <span className="saas-col-sub">e.g. 50</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Category *</span>
                  <span className="saas-col-sub">Men, Women, Footwear...</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Subcategory</span>
                  <span className="saas-col-sub">e.g. Polo T-Shirts, Dresses</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title required">Primary Cover Image (Front View) *</span>
                  <span className="saas-col-sub">Slot 1 front cover photo URL</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Gallery Angle Image 2</span>
                  <span className="saas-col-sub">Side / angle 2 photo URL</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Gallery Angle Image 3</span>
                  <span className="saas-col-sub">Back / angle 3 photo URL</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Gallery Angle Image 4</span>
                  <span className="saas-col-sub">Detail / angle 4 photo URL</span>
                </div>
                <div className="saas-col-guide-card">
                  <span className="saas-col-title">Gallery Angle Image 5</span>
                  <span className="saas-col-sub">Styling / angle 5 photo URL</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View 3: Data Inspection & Preview Table */
          <div>
            {/* File info bar & KPIs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #cbd5e1",
                borderRadius: "14px",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {fileName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {parsedRows.length} total rows detected • {validRows.length} ready to import
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleResetFile}
                  disabled={importing}
                  className="saas-silver-action-btn"
                  style={{ fontSize: "11px", padding: "6px 12px" }}
                >
                  Choose Different File
                </button>
              </div>
            </div>

            {/* Optional Default Category Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                Default Category for missing rows:
              </span>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  background: "#ffffff",
                  outline: "none",
                  color: "#0f172a",
                }}
              >
                <option value="">Auto-detect from Category column</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Table */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#ffffff",
                maxHeight: "340px",
                overflowY: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", width: "45px" }}>#</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", width: "65px" }}>Image</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Product Title</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Category / Subcategory</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Price</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Stock</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => {
                    const primaryUrl = row.images[0];
                    return (
                      <tr
                        key={row.rowId}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: row.isValid ? "transparent" : "#fff1f2",
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{row.rowId}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                overflow: "hidden",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              {primaryUrl ? (
                                <img
                                  src={primaryUrl}
                                  alt={row.name || "Preview"}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon size={16} style={{ color: "#94a3b8" }} />
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: row.images.length >= 4 ? "#059669" : row.images.length > 0 ? "#2563eb" : "#94a3b8",
                                background: row.images.length >= 4 ? "#ecfdf5" : row.images.length > 0 ? "#eff6ff" : "#f1f5f9",
                                border: row.images.length >= 4 ? "1px solid #a7f3d0" : row.images.length > 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                whiteSpace: "nowrap",
                              }}
                              title={row.images.map((u, i) => `Slot ${i + 1}: ${u}`).join("\n")}
                            >
                              {row.images.length} {row.images.length === 1 ? "link" : "links"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>
                            {row.name || <span style={{ color: "#e11d48" }}>[Missing Title]</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#475569",
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontFamily: "monospace",
                              }}
                            >
                              slug: {row.slug || "auto-generated"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 12px", color: "#334155" }}>
                          <span style={{ fontWeight: 600 }}>{row.category || defaultCategory || "Auto"}</span>
                          {row.subcategory && (
                            <span style={{ color: "#64748b" }}> › {row.subcategory}</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          {row.price !== null && row.price > 0 ? (
                            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px" }}>
                              ₹{row.price.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "#e11d48",
                                fontWeight: 700,
                                background: "#fff1f2",
                                border: "1px solid #ffe4e6",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                              }}
                            >
                              Invalid Price
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#475569" }}>
                          {row.stock}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          {row.isValid ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                background: "#ecfdf5",
                                color: "#059669",
                                border: "1px solid #d1fae5",
                                borderRadius: "9999px",
                                padding: "2px 8px",
                                fontSize: "10px",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle size={10} /> Ready
                            </span>
                          ) : (
                            <span
                              title={row.errors.join(", ")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                background: "#fff1f2",
                                color: "#e11d48",
                                border: "1px solid #ffe4e6",
                                borderRadius: "9999px",
                                padding: "2px 8px",
                                fontSize: "10px",
                                fontWeight: 700,
                                cursor: "help",
                              }}
                            >
                              <AlertCircle size={10} /> {row.errors[0] || "Error"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Actions Footer */}
            <div className="saas-modal-footer">
              <button
                className="saas-btn-ghost"
                type="button"
                onClick={onClose}
                disabled={importing}
              >
                Cancel
              </button>
              <button
                className="saas-btn-primary"
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || validRows.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                }}
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Importing Products...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    <span>Import {validRows.length} Valid Products</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .saas-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
        }

        .saas-modal-card {
          width: 100%;
          max-width: 860px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(145deg, #ffffff 0%, #f6f8fb 30%, #e9eef5 65%, #dfe6f0 100%);
          border: 1px solid rgba(195, 208, 225, 0.85);
          border-radius: 24px;
          padding: 28px 30px;
          box-shadow: 
            0 30px 70px -15px rgba(15, 23, 42, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.95) inset,
            0 2px 6px rgba(255, 255, 255, 0.9) inset,
            0 12px 28px -6px rgba(148, 163, 184, 0.25);
          position: relative;
        }

        .saas-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(203, 213, 225, 0.6);
        }

        .saas-modal-title {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a 0%, #334155 50%, #1e293b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }

        .saas-modal-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .saas-modal-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(203, 213, 225, 0.9);
          background: linear-gradient(180deg, #ffffff 0%, #edf2f7 50%, #e2e8f0 100%);
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #475569;
          font-size: 13px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
          transition: all 0.15s ease;
        }

        .saas-modal-close:hover {
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
          color: #0f172a;
          border-color: #94a3b8;
          transform: scale(1.05);
        }

        .saas-silver-action-btn {
          padding: 8px 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 45%, #e2e8f0 100%);
          border: 1px solid rgba(175, 190, 210, 0.9);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .saas-silver-action-btn:hover {
          background: linear-gradient(180deg, #ffffff 0%, #edf2f7 45%, #dce4ee 100%);
          border-color: #94a3b8;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 1px 0 #ffffff;
        }

        .saas-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(203, 213, 225, 0.7);
        }

        .saas-btn-ghost {
          padding: 10px 18px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          transition: all 0.15s ease;
        }

        .saas-btn-ghost:hover {
          background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
          color: #0f172a;
          border-color: #94a3b8;
        }

        .saas-btn-primary {
          padding: 10px 20px;
          background: linear-gradient(180deg, #0ea5e9 0%, #2563eb 100%);
          border: 1px solid #1d4ed8;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          transition: all 0.15s ease;
        }

        .saas-btn-primary:hover {
          background: linear-gradient(180deg, #0284c7 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }

        .saas-badge-file {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .saas-col-guide-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .saas-col-title {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
        }

        .saas-col-title.required {
          color: #2563eb;
        }

        .saas-col-sub {
          font-size: 10px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
