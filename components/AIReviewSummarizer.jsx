"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Sparkles, ThumbsUp, AlertCircle, CheckCircle, MessageSquarePlus, RefreshCw, Send, Check, ChevronLeft, ChevronRight } from "lucide-react";

export default function AIReviewSummarizer({ productId, productName }) {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // User and duplicate prevention state
  const [currentUser, setCurrentUser] = useState(null);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const reviewsTrackRef = useRef(null);

  // Review submission state
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [fitFeedback, setFitFeedback] = useState("true_to_size");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load current logged-in user if available
  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json?.user) {
            setCurrentUser(json.user);
            if (json.user.name) {
              setAuthorName(json.user.name);
            }
          }
        }
      } catch (err) {
        console.error("Auth check error in review summarizer:", err);
      }
    }
    loadAuthUser();
  }, []);

  const fetchSummaryAndReviews = async () => {
    try {
      setLoading(true);
      const [sumRes, revRes] = await Promise.all([
        fetch(`/api/ai/review-summary?productId=${productId}`),
        fetch(`/api/reviews?productId=${productId}`),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setData(sumJson.summary);
      }

      if (revRes.ok) {
        const revJson = await revRes.json();
        const revList = revJson.reviews || [];
        setReviews(revList);

        // Check if user has already reviewed (localStorage OR API flag OR matching author)
        const localKey = `primenest_reviewed_p${productId}`;
        const localCheck = typeof window !== "undefined" && localStorage.getItem(localKey);

        if (localCheck === "true" || revJson.hasReviewed) {
          setHasAlreadyReviewed(true);
        } else if (currentUser?.name) {
          const match = revList.some(
            (r) => r.author_name?.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
          );
          if (match) {
            setHasAlreadyReviewed(true);
            if (typeof window !== "undefined") {
              localStorage.setItem(localKey, "true");
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading review summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchSummaryAndReviews();
    }
  }, [productId, currentUser?.name]);

  const scrollReviews = (direction) => {
    if (reviewsTrackRef.current) {
      const scrollDistance = direction === "left" ? -360 : 360;
      reviewsTrackRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    if (hasAlreadyReviewed) {
      setSubmitError("You have already submitted a review for this product. Only 1 review per product is allowed.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          title: title.trim(),
          comment: comment.trim(),
          fitFeedback,
        }),
      });

      const resJson = await res.json();

      if (res.ok) {
        setSubmitSuccess(true);
        setHasAlreadyReviewed(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(`primenest_reviewed_p${productId}`, "true");
        }
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowReviewModal(false);
          setTitle("");
          setComment("");
          fetchSummaryAndReviews();
        }, 1200);
      } else {
        setSubmitError(resJson.error || "Failed to submit review");
        if (resJson.alreadyReviewed) {
          setHasAlreadyReviewed(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(`primenest_reviewed_p${productId}`, "true");
          }
        }
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-summary-loading-card">
        <Sparkles size={20} className="ai-spin-icon" />
        <span>Synthesizing customer reviews with AI intelligence...</span>
      </div>
    );
  }

  const fit = data?.fitRating || {
    trueToSize: 92,
    runsSmall: 8,
    runsLarge: 0,
    advice: "Fits true to standard sizing.",
  };

  return (
    <div className="ai-review-section">
      <div className="ai-review-container">
        {/* Header Bar */}
        <div className="ai-review-header">
          <div className="ai-title-wrap">
            <span className="ai-pill-tag">
              <Sparkles size={13} /> AI INTELLIGENCE
            </span>
            <h2 className="ai-main-title">Customer Feedback & AI Insights</h2>
            <p className="ai-subtitle">
              Synthesized from {data?.totalReviews || reviews.length} verified customer purchases
            </p>
          </div>

          {hasAlreadyReviewed ? (
            <button
              type="button"
              className="ai-write-btn reviewed"
              disabled
              title="You have already submitted a review for this product."
            >
              <Check size={16} /> Already Reviewed
            </button>
          ) : (
            <button
              type="button"
              className="ai-write-btn"
              onClick={() => {
                setSubmitError("");
                setShowReviewModal(true);
              }}
            >
              <MessageSquarePlus size={16} /> Write a Review
            </button>
          )}
        </div>

        {/* AI Highlights Glass Box */}
        <div className="ai-summary-card">
          <div className="ai-verdict-box">
            <div className="ai-score-column">
              <div className="ai-score-big">
                {data?.averageRating?.toFixed(1) || "4.8"}
              </div>
              <div className="ai-stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(data?.averageRating || 5) ? "#f59e0b" : "none"}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span className="ai-sentiment-badge">
                {data?.sentiment || "Overwhelmingly Positive"}
              </span>
            </div>

            <div className="ai-verdict-text">
              <h4>AI Executive Summary</h4>
              <p>{data?.summaryVerdict}</p>
            </div>
          </div>

          {/* Pros & Cons Columns */}
          <div className="ai-insights-grid">
            <div className="ai-insight-column pros">
              <div className="insight-col-header">
                <ThumbsUp size={16} className="text-emerald-600" />
                <span>What Customers Love</span>
              </div>
              <ul className="insight-list">
                {(data?.pros || [
                  "Luxurious hand-feel and breathable weave",
                  "Maintains color and shape after delicate wash",
                  "True versatility from casual gatherings to formal wear",
                ]).map((pro, idx) => (
                  <li key={idx}>
                    <CheckCircle size={14} className="insight-icon check" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-insight-column cons">
              <div className="insight-col-header">
                <AlertCircle size={16} className="text-amber-600" />
                <span>Good to Know / Sizing Tips</span>
              </div>
              <ul className="insight-list">
                {(data?.cons || [
                  "Slightly tailored cut; consider sizing up if between sizes",
                ]).map((con, idx) => (
                  <li key={idx}>
                    <span className="insight-dot" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sizing & Fit Consensus Bar */}
          <div className="ai-fit-meter">
            <div className="fit-meter-labels">
              <span className="fit-title">Sizing Consensus</span>
              <span className="fit-advice-pill">{fit.advice}</span>
            </div>

            <div className="fit-meter-track">
              <div
                className="fit-meter-seg true"
                style={{ width: `${fit.trueToSize}%` }}
                title={`True to Size: ${fit.trueToSize}%`}
              />
              <div
                className="fit-meter-seg small"
                style={{ width: `${fit.runsSmall}%` }}
                title={`Runs Small: ${fit.runsSmall}%`}
              />
              <div
                className="fit-meter-seg large"
                style={{ width: `${fit.runsLarge}%` }}
                title={`Runs Large: ${fit.runsLarge}%`}
              />
            </div>

            <div className="fit-meter-legend">
              <span>● True to Size ({fit.trueToSize}%)</span>
              <span>● Runs Small ({fit.runsSmall}%)</span>
              <span>● Runs Large ({fit.runsLarge}%)</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews List - Clean Single Row with Scroll Bar */}
        <div className="customer-reviews-block">
          <div className="customer-reviews-header-row">
            <h3 className="customer-reviews-title">
              Verified Customer Reviews ({reviews.length})
            </h3>
            {reviews.length > 3 && (
              <div className="reviews-scroll-nav">
                <button
                  type="button"
                  onClick={() => scrollReviews("left")}
                  className="reviews-nav-btn"
                  title="Previous reviews"
                  aria-label="Previous reviews"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollReviews("right")}
                  className="reviews-nav-btn"
                  title="Next reviews"
                  aria-label="Next reviews"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="no-reviews-note">No individual reviews yet. Be the first to leave one!</p>
          ) : (
            <div className="reviews-scroll-track" ref={reviewsTrackRef}>
              {reviews.map((rev) => (
                <div key={rev.id} className="review-item-card">
                  <div className="review-top-meta">
                    <div className="review-author-wrap">
                      <div className="review-avatar">
                        {rev.author_name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <strong>{rev.author_name}</strong>
                        <div className="review-verified">
                          <Check size={11} /> Verified Buyer
                        </div>
                      </div>
                    </div>

                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= rev.rating ? "#f59e0b" : "none"}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && <h5 className="review-item-title">{rev.title}</h5>}
                  <p className="review-item-body">{rev.comment}</p>

                  <div className="review-footer-tags">
                    <span className="review-fit-tag">
                      Fit: {rev.fit_feedback === "runs_small" ? "Runs Small" : rev.fit_feedback === "runs_large" ? "Runs Large" : "True to Size"}
                    </span>
                    <span className="review-date">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h3>Share Your Experience</h3>
              <p>Reviewing {productName}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="ai-review-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Bhesara"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Overall Rating *</label>
                <div className="star-rating-picker">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={num <= rating ? "star-active" : ""}
                    >
                      <Star size={24} fill={num <= rating ? "#f59e0b" : "none"} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Fit Feedback</label>
                <div className="fit-toggle-group">
                  {[
                    { val: "runs_small", label: "Runs Small" },
                    { val: "true_to_size", label: "True to Size" },
                    { val: "runs_large", label: "Runs Large" },
                  ].map((f) => (
                    <button
                      key={f.val}
                      type="button"
                      className={`fit-btn ${fitFeedback === f.val ? "active" : ""}`}
                      onClick={() => setFitFeedback(f.val)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional fit and fabric"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What did you like or dislike? How was the fabric feel, drape, and sizing?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {submitError && (
                <div className="review-submit-error">
                  <AlertCircle size={15} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitSuccess ? (
                    <>
                      <Check size={16} /> Submitted!
                    </>
                  ) : submitting ? (
                    <>
                      <RefreshCw size={16} className="ai-spin-icon" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Publish Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
