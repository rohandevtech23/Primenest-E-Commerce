"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, ShoppingBag, ArrowRight, RefreshCw, Bot, User } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const STARTER_PROMPTS = [
  "Curate an outfit for an evening dinner date",
  "Show me authentic footwear under ₹3,000",
  "What matches well with the Oxford Shirt?",
  "Breathable summer linen collection",
];

export default function AIShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const [addedMap, setAddedMap] = useState({});

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am your PrimeNest Personal Stylist & Shopping Concierge. Whether you're assembling a bespoke look, searching for seasonal fabrics, or finding the ideal gift, I am here to assist you.",
      products: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error("Stylist service unavailable");
      }

      const data = await response.json();

      const assistantMsg = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: data.reply || "Here are pieces from our collection tailored to your request:",
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
          text: "I am having trouble accessing the catalog at this precise moment. Please explore our shop collection or ask again in a moment.",
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
    }, 2000);
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
          <div className="fab-pulse" />
          <div className="fab-content">
            <Sparkles size={18} className="fab-sparkle" />
            <span className="fab-label">AI Stylist</span>
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
                <Sparkles size={16} />
              </div>
              <div>
                <h4>PrimeNest Stylist</h4>
                <span className="ai-online-status">
                  <span className="online-dot" /> AI Shopping Concierge
                </span>
              </div>
            </div>

            <button
              type="button"
              className="ai-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="ai-quick-prompts">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-prompt-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
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
                  <p>{msg.text}</p>

                  {/* Render Product Cards inside Assistant Message */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="ai-card-carousel">
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
                              <img src={img} alt={p.name} />
                            </Link>

                            <div className="ai-card-details">
                              <span className="ai-card-cat">{p.category}</span>
                              <Link
                                href={`/product/${p.id}`}
                                className="ai-card-name"
                              >
                                {p.name}
                              </Link>
                              <div className="ai-card-price">
                                ₹{Number(p.price).toLocaleString("en-IN")}
                              </div>

                              <div className="ai-card-actions">
                                <Link
                                  href={`/product/${p.id}`}
                                  className="ai-btn-view"
                                >
                                  View
                                </Link>

                                <button
                                  type="button"
                                  className={`ai-btn-add ${isAdded ? "added" : ""}`}
                                  onClick={() => handleQuickAdd(p)}
                                >
                                  {isAdded ? "Added!" : "+ Bag"}
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
              <div className="ai-message-row assistant-row">
                <div className="ai-msg-avatar">
                  <Sparkles size={13} />
                </div>
                <div className="ai-message-bubble loading-bubble">
                  <div className="ai-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>Consulting catalog & style trends...</small>
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
            <input
              type="text"
              placeholder="Ask for an outfit, occasion, or style tip..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
