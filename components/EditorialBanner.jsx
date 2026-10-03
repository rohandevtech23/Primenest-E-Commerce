export default function EditorialBanner() {
  return (
    <section className="editorial-banner">

      <div className="editorial-image" />

      <div className="editorial-overlay" />

      <div className="editorial-content">

        <p className="editorial-label">
          THE PRIMENEST PERSPECTIVE
        </p>

        <h2>
          Less noise.
          <br />
          <em>More character.</em>
        </h2>

        <p className="editorial-description">
          We believe the things you choose to live with
          should feel considered, timeless and distinctly yours.
        </p>

        <a href="/about" className="editorial-link">
          Discover our philosophy
          <span>↗</span>
        </a>

      </div>

    </section>
  );
}