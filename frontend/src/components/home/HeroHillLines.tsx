import React from "react";
import { motion } from "framer-motion";

export const HeroHillLines: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <filter id="white-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Hill lines */}
    <path className="hill-line" d="M0,600 C400,300 1040,300 1440,600" />
    <path className="hill-line" d="M0,650 C400,350 1040,350 1440,650" />
    <path className="hill-line" d="M0,720 C400,480 1040,480 1440,720" />
    <path className="hill-line" d="M0,800 C400,600 1040,600 1440,800" />
    
    {/* Animated dashes */}
    <path className="dash" d="M0,600 C400,300 1040,300 1440,600" />
    <path className="dash dash2" d="M0,650 C400,350 1040,350 1440,650" />
    <path className="dash dash3" d="M0,720 C400,480 1040,480 1440,720" />
    <path className="dash dash4" d="M0,800 C400,600 1040,600 1440,800" />
    
    <style>
      {`
      .hill-line {
        fill: none;
        stroke: #23242a;
        stroke-width: 1;
      }
      .dash {
        fill: none;
        stroke: #fff;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-dasharray: 14 900;
        stroke-dashoffset: 900;
        filter: url(#white-glow);
        animation: slide 8s linear infinite;
      }
      .dash.dash2 { animation-delay: 0.5s; }
      .dash.dash3 { animation-delay: 1s; }
      .dash.dash4 { animation-delay: 1.5s; }
      @keyframes slide {
        to { stroke-dashoffset: 0; }
      }
      `}
    </style>
  </svg>
);

export default HeroHillLines;