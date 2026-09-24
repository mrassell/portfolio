'use client';

import { useState } from 'react';

export default function BasketballHero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center h-full">
      <div
        className="basketball-character"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          cursor: 'pointer',
          transform: 'translateZ(0)',
        }}
      >
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isHovered ? 'excited' : ''}
        >
          {/* Left Arm */}
          <g className="arm-left">
            <path
              d="M 85 140 Q 40 140, 30 120"
              stroke="#000"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="30" cy="120" r="16" fill="#fdba74" stroke="#000" strokeWidth="3" />
          </g>

          {/* Right Arm */}
          <g className="arm-right">
            <path
              d="M 195 140 Q 240 140, 250 120"
              stroke="#000"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="250" cy="120" r="16" fill="#fdba74" stroke="#000" strokeWidth="3" />
          </g>

          {/* Body (Basketball) */}
          <circle cx="140" cy="140" r="70" fill="#fdba74" stroke="#000" strokeWidth="4" />
          
          {/* Basketball Lines */}
          <path
            d="M 140 70 Q 155 140, 140 210"
            stroke="#000"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M 140 70 Q 125 140, 140 210"
            stroke="#000"
            strokeWidth="2.5"
            fill="none"
          />
          <ellipse cx="140" cy="140" rx="70" ry="25" stroke="#000" strokeWidth="2.5" fill="none" />

          {/* Face */}
          {/* Eyes */}
          <g className="eyes">
            <ellipse cx="115" cy="125" rx="8" ry="12" fill="#000" />
            <ellipse cx="165" cy="125" rx="8" ry="12" fill="#000" />
            {/* Eye whites */}
            <ellipse cx="117" cy="122" rx="3" ry="4" fill="#fff" />
            <ellipse cx="167" cy="122" rx="3" ry="4" fill="#fff" />
          </g>

          {/* Mouth */}
          <g className="mouth">
            <path
              d="M 115 155 Q 140 165, 165 155"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Cheeks */}
          <circle cx="95" cy="145" r="8" fill="#fb923c" opacity="0.6" />
          <circle cx="185" cy="145" r="8" fill="#fb923c" opacity="0.6" />

          {/* Left Leg */}
          <g className="leg-left">
            <path
              d="M 115 205 Q 105 250, 100 270"
              stroke="#000"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Shoe */}
            <ellipse cx="100" cy="280" rx="22" ry="14" fill="#fff" stroke="#000" strokeWidth="3" />
            <ellipse cx="97" cy="280" rx="12" ry="8" fill="#000" />
          </g>

          {/* Right Leg */}
          <g className="leg-right">
            <path
              d="M 165 205 Q 175 250, 180 270"
              stroke="#000"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Shoe */}
            <ellipse cx="180" cy="280" rx="22" ry="14" fill="#fff" stroke="#000" strokeWidth="3" />
            <ellipse cx="177" cy="280" rx="12" ry="8" fill="#000" />
          </g>
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes bounce-arm-left {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-15deg);
          }
        }

        @keyframes bounce-arm-right {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }

        @keyframes wave-arm-left {
          0%, 100% {
            transform: rotate(-15deg);
          }
          25% {
            transform: rotate(-45deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        @keyframes wave-arm-right {
          0%, 100% {
            transform: rotate(15deg);
          }
          25% {
            transform: rotate(45deg);
          }
          75% {
            transform: rotate(-5deg);
          }
        }

        @keyframes excited-jump {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        @keyframes blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        .basketball-character {
          animation: float 3s ease-in-out infinite;
        }

        .arm-left {
          transform-origin: 85px 140px;
          animation: bounce-arm-left 3s ease-in-out infinite;
        }

        .arm-right {
          transform-origin: 195px 140px;
          animation: bounce-arm-right 3s ease-in-out infinite;
        }

        .eyes {
          animation: blink 4s ease-in-out infinite;
          transform-origin: center;
        }

        .basketball-character.excited svg {
          animation: excited-jump 0.6s ease-in-out;
        }

        .basketball-character.excited .arm-left {
          animation: wave-arm-left 0.6s ease-in-out;
        }

        .basketball-character.excited .arm-right {
          animation: wave-arm-right 0.6s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .basketball-character,
          .arm-left,
          .arm-right,
          .eyes,
          .basketball-character.excited svg,
          .basketball-character.excited .arm-left,
          .basketball-character.excited .arm-right {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
