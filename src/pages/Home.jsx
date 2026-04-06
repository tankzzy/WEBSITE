import { Link } from "react-router-dom";

const products = [
  {
    icon: "fa-users",
    title: "Copy Trading",
    description:
      "Access that allows users to automatically benefit from the expertise and performance of more experienced traders.",
  },
  {
    icon: "fa-money-bill-transfer",
    title: "Forex",
    description:
      "Access 1,200+ forex pairs across equities, indices, interest rates, energy, metals and more.",
  },
  {
    icon: "fa-chart-pie",
    title: "Futures",
    description:
      "Access 300+ futures covering equity indices, energy, metals, agriculture, rates and more.",
  },
  {
    icon: "fa-building-columns",
    title: "Stocks",
    description:
      "Access 19,000+ stocks across core and emerging markets on 40+ exchanges worldwide.",
  },
];

const reviews = [
  {
    text: '"Very convenient for traders, and the spread for gold is relatively low compared to other brokers."',
    name: "Angela Nannenhorn",
    location: "United Kingdom",
  },
  {
    text: '"One of the best FX brokers I have used. Their trading conditions are excellent."',
    name: "Wade Palmer",
    location: "Germany",
  },
];

const awards = [
  {
    icon: "fa-trophy",
    title: "Best Mobile Trading Platform",
    subtitle: "European CEO Magazine 2019",
  },
  {
    icon: "fa-award",
    title: "Best Forex ECN Broker",
    subtitle: "UK Forex Awards 2020",
  },
  {
    icon: "fa-medal",
    title: "Best Trading Conditions",
    subtitle: "Forex Report Magazine 2021",
  },
];

const tickerItems = [
  { symbol: "TSLA", value: "$113.06", status: "loss", label: "-1.47%" },
  { symbol: "GOOGL", value: "$87.34", status: "profit", label: "+1.32%" },
  { symbol: "AAPL", value: "$129.62", status: "profit", label: "+3.68%" },
  { symbol: "MCD", value: "$269.47", status: "loss", label: "-1.29%" },
  { symbol: "AMZN", value: "$86.08", status: "profit", label: "+3.56%" },
  { symbol: "MSFT", value: "$224.93", status: "loss", label: "-1.18%" },
];

function Home() {
  return (
    <main className="home-exchange">
      <header className="hero">
        <div className="hero-bg-accent" />
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="fade-in-up">
              The world&apos;s most <br />
              <span className="home-accent-text">powerful trading platform.</span>
            </h1>
            <p className="fade-in-up delay-1">
              Get the most accurate market data, alerts, conversions, tools and
              more, all within the same app. Trade the markets directly with
              leading trading platforms.
            </p>
            <div className="hero-cta fade-in-up delay-2">
              <Link to="/signup" className="btn-primary btn-large">
                Get Started <i className="fa-solid fa-arrow-right" />
              </Link>
              <a href="#demo" className="btn-outline btn-large">
                Try Free Demo
              </a>
            </div>
          </div>

          <div className="hero-visual fade-in-up delay-3">
            <div className="platform-mockup">
              <div className="mockup-header">
                <div className="dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mockup-title">TGtradringservices WebTrader</div>
              </div>
              <div className="mockup-body">
                <div className="chart-area">
                  <div className="chart-top">
                    <div>
                      <span className="symbol">EUR/USD</span>{" "}
                      <span className="price">1.0924</span>{" "}
                      <span className="profit">+0.15%</span>
                    </div>
                  </div>
                  <svg
                    className="mock-chart"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,30 L10,25 L20,35 L30,15 L40,20 L50,5 L60,10 L70,2 L80,15 L90,5 L100,0 L100,40 L0,40 Z"
                      fill="rgba(0, 218, 243, 0.14)"
                    />
                    <path
                      d="M0,30 L10,25 L20,35 L30,15 L40,20 L50,5 L60,10 L70,2 L80,15 L90,5 L100,0"
                      fill="none"
                      stroke="#00daf3"
                      strokeWidth="0.8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="market-ticker" id="markets">
        <div className="ticker-track">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="ticker-item">
              <span className="sym">{item.symbol}</span>
              <span className="val">{item.value}</span>
              <span className={item.status}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="products-section" id="products">
        <div className="container">
          <div className="section-title text-center">
            <h2>Reach out to new investment opportunities.</h2>
            <p>
              Bring your trading ventures around the world, far beyond the
              limits of a single trading account.
            </p>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <div key={product.title} className="product-card">
                <div className="product-icon">
                  <i className={`fa-solid ${product.icon}`} />
                </div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <a href="#" className="product-link">
                  Explore <i className="fa-solid fa-arrow-right" />
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-3">
            <a href="#" className="btn-outline">
              Track all Forex markets
            </a>
          </div>
        </div>
      </section>

      <section className="benefits-section" id="benefits">
        <div className="container split-layout">
          <div className="split-content">
            <h2>Tight spreads and ultra-fast execution</h2>
            <p className="subtitle">
              Best market prices available so you can receive excellent
              conditions. Your premium choice for trading currencies and stocks
              online.
            </p>
            <ul className="benefits-list">
              <li>
                <i className="fa-solid fa-shield-halved" /> Negative balance
                protection
              </li>
              <li>
                <i className="fa-solid fa-vault" /> Segregated and supervised
                client funds
              </li>
              <li>
                <i className="fa-solid fa-bolt" /> Instant deposit and fast
                withdrawal
              </li>
            </ul>
          </div>
          <div className="split-image">
            <div className="feature-box">
              <div className="fb-icon">
                <i className="fa-solid fa-stopwatch" />
              </div>
              <div className="fb-text">
                <h4>&lt;0.01s</h4>
                <span>Average Execution Time</span>
              </div>
            </div>
            <div className="feature-box offset">
              <div className="fb-icon">
                <i className="fa-solid fa-compress" />
              </div>
              <div className="fb-text">
                <h4>0.0 Pips</h4>
                <span>Spreads Starting From</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="social-proof-section" id="academy">
        <div className="container">
          <div className="section-title text-center">
            <h2>More than 23,000 traders joined</h2>
            <p>See more trader stories from all over the world.</p>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.name} className="review-card">
                <div className="stars">
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                </div>
                <p className="review-text">{review.text}</p>
                <div className="reviewer">
                  <h5>{review.name}</h5>
                  <span>{review.location}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="awards-strip">
            {awards.map((award) => (
              <div key={award.title} className="award-item">
                <i className={`fa-solid ${award.icon}`} />
                <div>
                  <h6>{award.title}</h6>
                  <span>{award.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="final-cta">
        <div className="container text-center">
          <h2>Ready to get started?</h2>
          <p>Global access to financial markets from a single account.</p>
          <Link to="/signup" className="btn-primary btn-large">
            Create Account
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="brand">
                <i className="fa-solid fa-chart-line logo-icon" />
                TGtradringservices
              </Link>
              <p className="disclaimer">
                Trading Forex and CFDs carries a high level of risk and may not
                be suitable for all investors.
              </p>
            </div>
            <div className="footer-links">
              <h4>Instruments</h4>
              <ul>
                <li>
                  <a href="#">Stock</a>
                </li>
                <li>
                  <a href="#">Indexes</a>
                </li>
                <li>
                  <a href="#">Currencies</a>
                </li>
                <li>
                  <a href="#">Metals</a>
                </li>
                <li>
                  <a href="#">Oil and gas</a>
                </li>
                <li>
                  <a href="#">Cryptocurrencies</a>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Analytics</h4>
              <ul>
                <li>
                  <a href="#">World Markets</a>
                </li>
                <li>
                  <a href="#">
                    Trading Central <span className="new-badge">New</span>
                  </a>
                </li>
                <li>
                  <a href="#">Forex charts online</a>
                </li>
                <li>
                  <a href="#">Market calendar</a>
                </li>
                <li>
                  <a href="#">Central banks</a>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Education and Links</h4>
              <ul>
                <li>
                  <a href="#">Basic course</a>
                </li>
                <li>
                  <a href="#">Introductory webinar</a>
                </li>
                <li>
                  <a href="#">About academy</a>
                </li>
                <li>
                  <a href="#">Login / Register</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 TGtradringservices. All Rights Reserved.</p>
            <ul className="legal-links">
              <li>
                <a href="#">Risk disclosure</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
              <li>
                <a href="#">Customer Agreement</a>
              </li>
              <li>
                <a href="#">AML policy</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
