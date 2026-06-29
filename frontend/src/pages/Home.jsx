import { Link } from "react-router-dom";

const products = [
  {
    icon: "fa-users",
    title: "Copy Trading",
    accent: "cyan",
    description:
      "Access that allows users to automatically benefit from the expertise and performance of more experienced traders.",
  },
  {
    icon: "fa-money-bill-transfer",
    title: "Forex",
    accent: "cyan",
    description:
      "Access 1,200+ forex pairs across equities, indices, interest rates, energy, metals and more.",
  },
  {
    icon: "fa-chart-pie",
    title: "Futures",
    accent: "cyan",
    description:
      "Access 300+ futures covering equity indices, energy, metals, agriculture, rates and more.",
  },
  {
    icon: "fa-building-columns",
    title: "Stocks",
    accent: "cyan",
    description:
      "Access 19,000+ stocks across core and emerging markets on 40+ exchanges worldwide.",
  },
  {
    icon: "fa-car-side",
    title: "Tesla",
    accent: "tesla",
    description:
      "Invest in Tesla for exposure to one of the market's most closely watched innovation-led equities, with growth tied to electric vehicles, energy storage, and global expansion.",
  },
  {
    icon: "fa-coins",
    title: "Gold",
    accent: "gold",
    description:
      "Invest in gold as a time-tested store of value with strong defensive appeal during inflation, currency pressure, and broader market uncertainty.",
  },
  {
    icon: "fa-medal",
    title: "Silver",
    accent: "silver",
    description:
      "Gain exposure to silver for a balanced mix of precious-metal protection and industrial demand, making it a flexible asset in both growth and risk-off cycles.",
  },
];

const reviews = [
  {
    text: '"Very convenient for traders, and the spread for gold is relatively low compared to other brokers."',
    name: "Angela Nannenhorn",
    location: "United Kingdom",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  },
  {
    text: '"Tesla is one of the assets I watch most, and this platform makes it easier to follow price movement and stay positioned without losing sight of broader market risk."',
    name: "Wade Palmer",
    location: "Germany",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    text: '"The platform feels stable, execution is fast, and I like having metals, stocks, and forex in one place without a cluttered dashboard."',
    name: "Michael Carter",
    location: "United States",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  },
  {
    text: '"A refined trading experience with clean reporting and reliable access. The gold and currency offerings fit well with how I manage risk."',
    name: "Luca Meier",
    location: "Switzerland",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
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
  { symbol: "XAU/USD", value: "$2,348.60", status: "profit", label: "+0.82%" },
  { symbol: "XAG/USD", value: "$27.44", status: "profit", label: "+0.56%" },
  { symbol: "TSLA", value: "$113.06", status: "loss", label: "-1.47%" },
  { symbol: "GOOGL", value: "$87.34", status: "profit", label: "+1.32%" },
  { symbol: "AAPL", value: "$129.62", status: "profit", label: "+3.68%" },
  { symbol: "MCD", value: "$269.47", status: "loss", label: "-1.29%" },
  { symbol: "AMZN", value: "$86.08", status: "profit", label: "+3.56%" },
  { symbol: "MSFT", value: "$224.93", status: "loss", label: "-1.18%" },
];

const heroSignals = [
  { label: "Execution", value: "<0.01s" },
  { label: "Asset Coverage", value: "19K+" },
  { label: "Live Uptime", value: "99.99%" },
];

const investmentPlans = [
  {
    name: "Basic",
    roi: "150%",
    unit: "/ Trade",
    min: "$500",
    max: "$120000",
    badge: "Premium",
  },
  {
    name: "Beginner Plan",
    roi: "16%",
    unit: "/ Trade",
    min: "$2000",
    max: "$25000",
  },
  {
    name: "Standard Plan",
    roi: "2.5%",
    unit: "/ Trade",
    min: "$25000",
    max: "$100000",
  },
  {
    name: "Business Plan",
    roi: "3.1%",
    unit: "/ Trade",
    min: "$100000",
    max: "$1000000",
  },
  {
    name: "Intermediate",
    roi: "25%",
    unit: "/ Trade",
    min: "$35000",
    max: "$250000",
    badge: "Premium",
  },
];

function Home() {
  return (
    <main className="home-exchange">
      <header className="hero">
        <div className="hero-bg-accent" />
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-kicker fade-in-up">
              <span className="hero-kicker-pill">
                <i className="fa-solid fa-wave-square" />
                Multi-market command center
              </span>
              <span className="hero-kicker-note">Trusted by active global traders</span>
            </div>
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

            <div className="hero-signal-row fade-in-up delay-3">
              {heroSignals.map((signal) => (
                <article key={signal.label} className="hero-signal-card">
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-visual fade-in-up delay-3">
            <div className="hero-visual-orbit hero-orbit-one" />
            <div className="hero-visual-orbit hero-orbit-two" />
            <div className="hero-floating-card hero-floating-card-top">
              <span className="hero-floating-label">Live signal</span>
              <strong>BTC Momentum</strong>
              <div className="hero-floating-inline">
                <span>$67,432.10</span>
                <small className="profit">+1.24%</small>
              </div>
            </div>
            <div className="hero-floating-card hero-floating-card-bottom">
              <span className="hero-floating-label">Desk flow</span>
              <strong>Institutional Activity</strong>
              <div className="hero-allocation-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="hero-floating-card hero-floating-card-metals">
              <span className="hero-floating-label">Watchlist</span>
              <strong>Metals & Tesla</strong>
              <div className="hero-metals-list">
                <div className="hero-metals-item">
                  <span>XAU/USD</span>
                  <small className="profit">+$2,348.60</small>
                </div>
                <div className="hero-metals-item">
                  <span>XAG/USD</span>
                  <small className="profit">+$27.44</small>
                </div>
                <div className="hero-metals-item">
                  <span>TSLA</span>
                  <small className="profit">$248.32</small>
                </div>
              </div>
            </div>

            <div className="hero-showcase-card">
              <div className="hero-showcase-head">
                <div className="hero-showcase-title">
                  <span className="hero-floating-label">LG Prime Terminal</span>
                  <strong>Cross-market intelligence</strong>
                </div>
                <div className="hero-showcase-chip">Live</div>
              </div>

              <div className="hero-display-panel">
                <div className="hero-display-topline">
                  <div>
                    <span className="hero-display-symbol">EUR/USD</span>
                    <strong>1.0924</strong>
                  </div>
                  <div className="hero-display-metric profit">
                    <i className="fa-solid fa-arrow-trend-up" />
                    +0.15%
                  </div>
                </div>

                <svg
                  className="hero-display-chart"
                  viewBox="0 0 1000 320"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="heroChartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00daf3" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00daf3" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,255 C90,248 120,178 200,192 C280,205 340,108 410,124 C500,144 540,64 618,78 C700,95 770,28 846,46 C908,60 950,26 1000,10 L1000,320 L0,320 Z"
                    fill="url(#heroChartGradient)"
                  />
                  <path
                    d="M0,255 C90,248 120,178 200,192 C280,205 340,108 410,124 C500,144 540,64 618,78 C700,95 770,28 846,46 C908,60 950,26 1000,10"
                    fill="none"
                    stroke="#00daf3"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="hero-display-grid">
                  <article className="hero-display-stat">
                    <span>Session P/L</span>
                    <strong className="profit">+$12,840</strong>
                  </article>
                  <article className="hero-display-stat">
                    <span>Open Positions</span>
                    <strong>24</strong>
                  </article>
                  <article className="hero-display-stat">
                    <span>Risk Monitor</span>
                    <strong>Stable</strong>
                  </article>
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
              <div
                key={product.title}
                className={`product-card product-card-${product.accent}`}
              >
                <div className={`product-icon product-icon-${product.accent}`}>
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

      <section className="plans-section">
        <div className="container">
          <div className="section-title text-center">
            <span className="hero-kicker-pill plans-pill">
              <i className="fa-solid fa-layer-group" />
              Trading plans
            </span>
            <h2>Investment Opportunities</h2>
            <p>
              Choose the plan structure that suits your investment strategy and
              financial goals.
            </p>
          </div>

          <div className="plans-grid">
            {investmentPlans.map((plan) => (
              <article key={plan.name} className="plan-card">
                <div className="plan-card-head">
                  <h3>{plan.name}</h3>
                  {plan.badge ? <span className="plan-badge">{plan.badge}</span> : null}
                </div>

                <div className="plan-card-body">
                  <div className="plan-roi">
                    <strong>{plan.roi}</strong>
                    <span>{plan.unit}</span>
                  </div>

                  <ul className="plan-features">
                    <li>Principal return on maturity</li>
                    <li>Instant Withdrawal</li>
                    <li>Professional Charts</li>
                    <li>24/7 Support</li>
                  </ul>

                  <div className="plan-limits">
                    <p>
                      <span>Min:</span> {plan.min}
                    </p>
                    <p>
                      <span>Max:</span> {plan.max}
                    </p>
                  </div>

                  <Link to="/signup" className="btn-primary plan-select-btn">
                    Select Plan
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="plans-cta-card">
            <div>
              <h3>Need a custom plan?</h3>
              <p>
                Our team can create tailored investment solutions for
                institutional clients and high-net-worth individuals.
              </p>
            </div>
            <Link to="/signup" className="btn-primary">
              Contact Our Team <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <section className="metals-spotlight-section">
        <div className="container metals-spotlight-grid">
          <div className="metals-spotlight-copy">
            <span className="hero-kicker-pill">
              <i className="fa-solid fa-coins" />
              Precious metals
            </span>
            <h2>Build long-term resilience with gold and silver exposure.</h2>
            <p>
              Gold and silver can strengthen a diversified portfolio by adding
              assets that investors often turn to during inflation, monetary
              uncertainty, and broader market stress.
            </p>
          </div>

          <div className="metals-spotlight-cards">
            <article className="metals-card metals-card-gold">
              <span>Gold</span>
              <strong>Wealth preservation and defensive positioning.</strong>
              <p>
                Gold is widely used as a strategic hedge because it has
                historically held value during periods of volatility and
                weakening paper currencies.
              </p>
            </article>

            <article className="metals-card metals-card-silver">
              <span>Silver</span>
              <strong>Precious metal protection with growth-sensitive demand.</strong>
              <p>
                Silver offers precious-metal appeal while also benefiting from
                industrial use, giving it a different return profile from gold.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="tesla-market-section">
        <div className="container tesla-market-grid">
          <div className="tesla-market-copy">
            <span className="hero-kicker-pill">
              <i className="fa-solid fa-car-side" />
              Tesla market
            </span>
            <h2>Track Tesla as a high-volatility innovation stock.</h2>
            <p>
              Tesla remains one of the most actively watched equities in the
              market, with price movement often driven by earnings, delivery
              updates, EV demand, margins, and broader sentiment around growth
              stocks.
            </p>
          </div>

          <div className="tesla-market-card">
            <div className="tesla-market-head">
              <div>
                <span>NASDAQ</span>
                <strong>TSLA</strong>
              </div>
              <div className="tesla-market-price">
                <strong>$248.32</strong>
                <small className="profit">+2.18%</small>
              </div>
            </div>

            <div className="tesla-market-chart" aria-hidden="true">
              <span />
            </div>

            <div className="tesla-market-stats">
              <article>
                <span>Sector</span>
                <strong>Automotive Tech</strong>
              </article>
              <article>
                <span>Momentum</span>
                <strong>High</strong>
              </article>
              <article>
                <span>Outlook</span>
                <strong>Growth-led</strong>
              </article>
            </div>
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
                  <img
                    src={review.image}
                    alt={review.name}
                    className="reviewer-avatar"
                  />
                  <div>
                  <h5>{review.name}</h5>
                  <span>{review.location}</span>
                  </div>
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
                LGtradringservices
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
            <p>&copy; 2026 LGtradringservices. All Rights Reserved.</p>
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
