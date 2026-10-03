const products = [
  {
    name: "Essential Oxford Shirt",
    category: "Men / Shirts",
    price: "₹1,899",
    badge: "NEW",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Relaxed Linen Dress",
    category: "Women / Dresses",
    price: "₹2,499",
    badge: "NEW",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Minimal Leather Watch",
    category: "Accessories",
    price: "₹3,299",
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Signature Eau de Parfum",
    category: "Perfume",
    price: "₹2,799",
    badge: "LIMITED",
    image:
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=900&q=85",
  },
];

export default function ProductShowcase() {
  return (
    <section className="product-showcase">

      <div className="product-heading">

        <div>
          <p className="product-label">
            NEW SEASON
          </p>

          <h2>
            Latest
            <em> Arrivals</em>
          </h2>
        </div>

        <a href="/shop" className="view-all-products">
          View all products
          <span>↗</span>
        </a>

      </div>

      <div className="product-grid">

        {products.map((product) => (
          <article
            className="product-card"
            key={product.name}
          >

            <div className="product-image-wrapper">

              <div
                className="product-image"
                style={{
                  backgroundImage: `url(${product.image})`,
                }}
              />

              <span className="product-badge">
                {product.badge}
              </span>

              <button
                className="product-wishlist"
                aria-label={`Add ${product.name} to wishlist`}
              >
                ♡
              </button>

              <button className="product-cart">
                Add to bag
                <span>+</span>
              </button>

            </div>

            <div className="product-info">

              <div>
                <p className="product-category">
                  {product.category}
                </p>

                <h3>
                  {product.name}
                </h3>
              </div>

              <p className="product-price">
                {product.price}
              </p>

            </div>

          </article>
        ))}

      </div>

    </section>
  );
}