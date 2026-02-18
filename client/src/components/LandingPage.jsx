import { Link } from 'react-router-dom'

function LandingPage() { 
  return ( 
    <section className="landingContainer">
      <div className="landingInfo">
        <p className="landingKicker">Think, Speak, Code, Repeat</p>
        <h1>CodeNexus</h1>
        <p className="landingSub">
          A lightweight playground for JavaScript, Python, and HTML/CSS — built for fast
          experiments and clean output.
        </p>

        <div className="landingActions" role="navigation" aria-label="Get started">
          <Link className="cta ctaPrimary" to="/javascript">
            Start with JavaScript
          </Link>
          <Link className="cta ctaGhost" to="/python">
            Run Python
          </Link>
          <Link className="cta ctaGhost" to="/html">
            Build a Web Snippet
          </Link>
        </div>

        <div className="landingCards" aria-label="Playgrounds">
          <Link className="landingCard" to="/javascript">
            <div className="landingCardTitle">JavaScript</div>
            <div className="landingCardBody">Instant runs with console output capture.</div>
          </Link>
          <Link className="landingCard" to="/python">
            <div className="landingCardTitle">Python</div>
            <div className="landingCardBody">Execute via your local server endpoint.</div>
          </Link>
          <Link className="landingCard" to="/html">
            <div className="landingCardTitle">HTML/CSS</div>
            <div className="landingCardBody">Live preview with a JavaScript run button.</div>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LandingPage