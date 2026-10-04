"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Check,
  Compass,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const STARTER_PROMPTS = [
  "Curate an outfit for an evening dinner date",
  "Show me red casual shoes or sneakers",
  "Dark green sneakers in catalog",
  "Luxury perfumes with woody notes",
  "Footwear under ₹5,000",
];

// Helper to format assistant markdown nicely (bolding, lists, linebreaks)
function formatAssistantMessage(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="ai-text-spacer" />;
    }

    // Parse **bold text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pIdx} className="ai-text-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // Check if line is a numbered item or bullet
    const isListItem = /^\s*(\d+\.|\-|\*)\s+/.test(line);

    return (
      <p key={lineIdx} className={`ai-text-line ${isListItem ? "ai-list-line" : ""}`}>
        {renderedLine}
      </p>
    );
  });
}

export default function AIShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const [addedMap, setAddedMap] = useState({});

  const initialWelcome = {
    id: "welcome",
    role: "assistant",
    text: "Welcome to PrimeNest Haute Concierge. I am your personal AI Stylist—ask me for outfit curations, specific colors, occasions, footwear, or luxury fragrances from our catalog.",
    products: [],
  };

  const [messages, setMessages] = useState([initialWelcome]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    const handleCustomOpen = (e) => {
      setIsOpen(true);
      if (e.detail?.query) {
        setTimeout(() => {
          handleSend(e.detail.query);
        }, 300);
      }
    };
    window.addEventListener("open-ai-stylist", handleCustomOpen);
    return () => window.removeEventListener("open-ai-stylist", handleCustomOpen);
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: String(Date.now()),
      role: "user",
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error("Stylist service unavailable");
      }

      const data = await response.json();

      const assistantMsg = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: data.reply || "Here are select pieces from our catalog curated for your request:",
        products: data.products || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Stylist error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "I encountered a brief moment connecting to our catalog. Please try asking again in a moment, or explore our curated shop collection.",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product) => {
    if (!product) return;
    addToCart(product, 1, null);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2200);
  };

  const handleResetSession = () => {
    setMessages([
      {
        ...initialWelcome,
        id: String(Date.now()),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-stylist-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Personal Stylist"
        >
          <div className="fab-aura-ring" />
          <div className="fab-pulse" />
          <div className="fab-content">
            <div className="fab-icon-wrap">
              <Sparkles size={18} className="fab-sparkle" />
            </div>
            <div className="fab-text-stack">
              <span className="fab-tagline">AI Concierge</span>
              <span className="fab-label">PrimeNest Stylist</span>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">
                <Sparkles size={17} className="header-sparkle-icon" />
                <span className="avatar-status-pip" />
              </div>
              <div>
                <div className="ai-header-title-row">
                  <h4 className="ai-brand-heading">PrimeNest Stylist</h4>
                  <span className="ai-badge-gemini">Haute AI</span>
                </div>
                <span className="ai-online-status">
                  <span className="online-dot" /> Live Shopping Concierge
                </span>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-header-btn"
                onClick={handleResetSession}
                title="Restart Style Consultation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Concierge"
                aria-label="Close Chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="ai-quick-prompts-wrapper">
            <div className="ai-prompts-hint">
              <Compass size={12} className="ai-prompts-icon" />
              <span>Inspirations:</span>
            </div>
            <div className="ai-quick-prompts">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ai-prompt-chip"
                  onClick={() => handleSend(prompt)}
                >
                  <Sparkles size={11} className="chip-sparkle" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="ai-msg-avatar">
                    <Sparkles size={13} />
                  </div>
                )}

                <div className="ai-message-bubble">
                  {msg.role === "assistant" ? (
                    <div className="ai-formatted-content">
                      {formatAssistantMessage(msg.text)}
                    </div>
                  ) : (
                    <p className="ai-user-text">{msg.text}</p>
                  )}

                  {/* Render Product Cards inside Assistant Message */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="ai-card-carousel">
                      <div className="ai-carousel-heading">
                        <span>Curated Suggestions ({msg.products.length})</span>
                      </div>
                      {msg.products.map((p) => {
                        const img =
                          p.image ||
                          p.images?.[0] ||
                          "/images/shop-banner.png";
                        const isAdded = !!addedMap[p.id];

                        return (
                          <div key={p.id} className="ai-product-card">
                            <Link
                              href={`/product/${p.id}`}
                              className="ai-card-thumb-link"
                            >
                              <img src={img} alt={p.name} loading="lazy" />
                              <div className="ai-card-thumb-overlay">
                                <ExternalLink size={12} />
                              </div>
                            </Link>

                            <div className="ai-card-details">
                              <div className="ai-card-top-meta">
                                <span className="ai-card-cat">{p.category}</span>
                                {p.subcategory && (
                                  <span className="ai-card-subcat">
                                    • {p.subcategory}
                                  </span>
                                )}
                              </div>

                              <Link
                                href={`/product/${p.id}`}
                                className="ai-card-name"
                                title={p.name}
                              >
                                {p.name}
                              </Link>

                              <div className="ai-card-price-row">
                                <span className="ai-card-price">
                                  ₹{Number(p.price).toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="ai-card-actions">
                                <Link
                                  href={`/product/${p.id}`}
                                  className="ai-btn-view"
                                >
                                  <span>View</span>
                                  <ArrowRight size={11} />
                                </Link>

                                <button
                                  type="button"
                                  className={`ai-btn-add ${isAdded ? "added" : ""}`}
                                  onClick={() => handleQuickAdd(p)}
                                  disabled={isAdded}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={12} /> Added
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag size={12} /> + Bag
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-row assistant-row loading-row">
                <div className="ai-msg-avatar pulse-avatar">
                  <Sparkles size={13} />
                </div>
                <div className="ai-message-bubble loading-bubble">
                  <div className="ai-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ai-typing-caption">
                    <span className="caption-gold">PrimeNest Stylist</span> is evaluating luxury fabrics & stock...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            className="ai-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="ai-input-pill-wrap">
              <input
                type="text"
                placeholder="Ask for an outfit, color, occasion, or style tip..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                autoFocus={false}
              />
              <button
                type="submit"
                className="ai-send-btn"
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="ai-input-footer-note">
              <span>Powered by Gemini Intelligence • Real-time Catalog Sync</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
