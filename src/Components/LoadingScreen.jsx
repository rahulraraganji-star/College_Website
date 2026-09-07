import React from "react";
import "./LoadingScreen.css";

/**
 * LoadingScreen - Heraldic Crest Loading Animation
 *
 * @param {boolean} fullScreen - Whether loader covers full viewport (fixed overlay) or container (relative)
 * @param {string} text - Optional loading caption text displayed beneath the progress bar
 * @param {boolean} showProgress - Whether to show the bottom golden sweep line
 * @param {boolean} transparent - Whether background should be transparent instead of #F8F5F0
 * @param {number} size - Optional pixel scale for SVG mark (default: 148)
 * @param {string} className - Optional extra class names for container
 */
const LoadingScreen = ({
  fullScreen = true,
  text,
  showProgress = true,
  transparent = false,
  size = 148,
  className = "",
}) => {
  // Pre-calculated 24 ticks around center (80, 80)
  const ticks = React.useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * 360;
      const isLong = i % 6 === 0;
      return {
        key: i,
        angle,
        y1: isLong ? 8 : 12,
        y2: isLong ? 18 : 16,
        opacity: isLong ? 0.9 : 0.35,
      };
    });
  }, []);

  const containerClasses = [
    "ls-root",
    fullScreen ? "ls-fullscreen" : "ls-inline",
    transparent ? "ls-transparent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* Texture grain */}
      {!transparent && <div className="ls-grain" aria-hidden="true" />}

      {/* Heraldic SVG Mark */}
      <div className="ls-mark" aria-hidden="true">
        <svg
          viewBox="0 0 160 160"
          className="ls-svg"
          style={size !== 148 ? { width: size, height: size } : undefined}
        >
          {/* Rotating radial compass tick ring */}
          <g className="ls-ring">
            {ticks.map((tick) => (
              <line
                key={tick.key}
                x1="80"
                y1={tick.y1}
                x2="80"
                y2={tick.y2}
                transform={`rotate(${tick.angle} 80 80)`}
                className="ls-tick"
                style={{ opacity: tick.opacity }}
              />
            ))}
          </g>

          {/* Golden corner brackets */}
          <g className="ls-corners">
            <path d="M 46 46 L 46 34 L 58 34" />
            <path d="M 114 46 L 114 34 L 102 34" />
            <path d="M 46 114 L 46 126 L 58 126" />
            <path d="M 114 114 L 114 126 L 102 126" />
          </g>

          {/* Heraldic Crest Shield with animated drawing lines */}
          <g className="ls-crest">
            <path
              className="ls-line ls-d1"
              pathLength="100"
              d="M56 50 L104 50 L104 80 Q104 94 94 103 L80 114 L66 103 Q56 94 56 80 Z"
            />
            <path
              className="ls-line ls-d2"
              pathLength="100"
              d="M80 50 L80 76"
            />
            <path
              className="ls-line ls-d2"
              pathLength="100"
              d="M58 76 L102 76"
            />
            <path
              className="ls-line ls-d3"
              pathLength="100"
              d="M69 56 L77 60 L69 64 L61 60 Z M69 64 L69 70"
            />
            <path
              className="ls-line ls-d3"
              pathLength="100"
              d="M91 54 L91 68 M91 54 L81 58 L81 66 L91 68 M91 54 L101 58 L101 66 L91 68"
            />
            <path
              className="ls-line ls-d4"
              pathLength="100"
              d="M80 76 L80 100 M65 85 L95 85 M69 85 L69 92 M91 85 L91 92 M63 92 L75 92 L69 98 Z M85 92 L97 92 L91 98 Z M73 100 L87 100"
            />
          </g>
        </svg>
      </div>

      {/* Sweep progress bar */}
      {showProgress && (
        <div className="ls-progress" aria-hidden="true">
          <div className="ls-progress-fill" />
        </div>
      )}

      {/* Optional loading caption text */}
      {text && <p className="ls-text">{text}</p>}
    </div>
  );
};

export default LoadingScreen;
