'use client';

import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function BasketballGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const [ballPos, setBallPos] = useState<Position>({ x: 140, y: 360 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 480, height: 500 });
  
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const dragStartTime = useRef(0);
  const velocity = useRef<Velocity>({ x: 0, y: 0 });
  const animationFrame = useRef<number>();
  const confettiParticles = useRef<Particle[]>([]);
  const confettiCanvas = useRef<HTMLCanvasElement>(null);

  // Responsive coordinates - scale based on viewBox
  const VIEWBOX_WIDTH = 480;
  const VIEWBOX_HEIGHT = 500;
  const HOOP_CENTER_X = 340;
  const HOOP_CENTER_Y = 160;
  const HOOP_RADIUS = 28;
  const BALL_RADIUS = 20;
  const GRAVITY = 0.6;
  const DRAG_MULTIPLIER = 3;
  const INITIAL_BALL_X = 140;
  const INITIAL_BALL_Y = 360;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const checkScore = (x: number, y: number, vy: number): boolean => {
    // More forgiving hitbox - use larger radius and wider vertical range
    const distanceToHoop = Math.sqrt(
      Math.pow(x - HOOP_CENTER_X, 2) + Math.pow(y - HOOP_CENTER_Y, 2)
    );
    
    return (
      distanceToHoop < HOOP_RADIUS + 5 &&
      y > HOOP_CENTER_Y - 15 &&
      y < HOOP_CENTER_Y + 30 &&
      vy > 0
    );
  };

  const startConfetti = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
      return;
    }

    setShowConfetti(true);
    confettiParticles.current = [];
    
    const colors = ['#fdba74', '#bef264', '#fbcfe8', '#c4b5fd', '#fef08a', '#93c5fd'];
    
    // Scale confetti position to actual canvas size
    const scaleX = dimensions.width / VIEWBOX_WIDTH;
    const scaleY = dimensions.height / VIEWBOX_HEIGHT;
    const canvasX = HOOP_CENTER_X * scaleX;
    const canvasY = HOOP_CENTER_Y * scaleY;
    
    for (let i = 0; i < 50; i++) {
      confettiParticles.current.push({
        x: canvasX,
        y: canvasY,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    animateConfetti();
  };

  const animateConfetti = () => {
    const canvas = confettiCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allDead = true;
    confettiParticles.current.forEach((p) => {
      if (p.life > 0) {
        allDead = false;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.life -= 0.02;
      }
    });

    if (!allDead) {
      requestAnimationFrame(animateConfetti);
    } else {
      setShowConfetti(false);
    }
  };

  const resetBall = () => {
    setIsFlying(false);
    setBallPos({ x: INITIAL_BALL_X, y: INITIAL_BALL_Y });
    velocity.current = { x: 0, y: 0 };
  };

  const updateBallPosition = () => {
    if (!isFlying) return;

    velocity.current.y += GRAVITY;
    
    const newX = ballPos.x + velocity.current.x;
    const newY = ballPos.y + velocity.current.y;

    if (checkScore(newX, newY, velocity.current.y)) {
      setScore(s => s + 1);
      startConfetti();
      setTimeout(resetBall, 1500);
      return;
    }

    if (newX < BALL_RADIUS || newX > VIEWBOX_WIDTH - BALL_RADIUS || 
        newY < BALL_RADIUS || newY > VIEWBOX_HEIGHT + 100) {
      setTimeout(resetBall, 500);
      return;
    }

    setBallPos({ x: newX, y: newY });
    animationFrame.current = requestAnimationFrame(updateBallPosition);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFlying) return;
    
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartTime.current = Date.now();
    
    if (ballRef.current) {
      ballRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isFlying) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scaleX = VIEWBOX_WIDTH / rect.width;
    const scaleY = VIEWBOX_HEIGHT / rect.height;
    
    const newX = (e.clientX - rect.left) * scaleX;
    const newY = (e.clientY - rect.top) * scaleY;
    
    setBallPos({
      x: Math.max(BALL_RADIUS, Math.min(VIEWBOX_WIDTH - BALL_RADIUS, newX)),
      y: Math.max(BALL_RADIUS, Math.min(VIEWBOX_HEIGHT - BALL_RADIUS, newY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const deltaTime = Math.max(Date.now() - dragStartTime.current, 1);
    const deltaX = (e.clientX - dragStartPos.current.x) / deltaTime;
    const deltaY = (e.clientY - dragStartPos.current.y) / deltaTime;
    
    velocity.current = {
      x: deltaX * DRAG_MULTIPLIER,
      y: deltaY * DRAG_MULTIPLIER,
    };
    
    setIsFlying(true);
    animationFrame.current = requestAnimationFrame(updateBallPosition);
  };

  useEffect(() => {
    if (isFlying) {
      updateBallPosition();
    }
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isFlying, ballPos]);

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[340px] md:max-w-[600px] h-[380px] md:h-[580px] touch-none select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Backboard */}
          <rect
            x="300"
            y="120"
            width="80"
            height="70"
            fill="#fdba74"
            stroke="#000"
            strokeWidth="4"
            rx="6"
          />
          
          {/* Hoop Rim */}
          <ellipse
            cx={HOOP_CENTER_X}
            cy={HOOP_CENTER_Y}
            rx={HOOP_RADIUS}
            ry="9"
            fill="none"
            stroke="#000"
            strokeWidth="4"
          />
          
          {/* Net */}
          <g stroke="#000" strokeWidth="2.5" opacity="0.7">
            <line x1="312" y1={HOOP_CENTER_Y} x2="317" y2={HOOP_CENTER_Y + 30} />
            <line x1="323" y1={HOOP_CENTER_Y} x2="325" y2={HOOP_CENTER_Y + 30} />
            <line x1="334" y1={HOOP_CENTER_Y} x2="333" y2={HOOP_CENTER_Y + 30} />
            <line x1="345" y1={HOOP_CENTER_Y} x2="341" y2={HOOP_CENTER_Y + 30} />
            <line x1="356" y1={HOOP_CENTER_Y} x2="349" y2={HOOP_CENTER_Y + 30} />
            <line x1="367" y1={HOOP_CENTER_Y} x2="357" y2={HOOP_CENTER_Y + 30} />
            <path d={`M 312 ${HOOP_CENTER_Y + 20} Q 337 ${HOOP_CENTER_Y + 23}, 357 ${HOOP_CENTER_Y + 20}`} fill="none" strokeWidth="2" />
          </g>

          {/* Basketball */}
          <g>
            <circle
              ref={ballRef}
              cx={ballPos.x}
              cy={ballPos.y}
              r={BALL_RADIUS}
              fill="#fdba74"
              stroke="#000"
              strokeWidth="3"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                filter: isDragging ? 'brightness(1.1)' : 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            {/* Basketball lines */}
            <path
              d={`M ${ballPos.x} ${ballPos.y - BALL_RADIUS} Q ${ballPos.x + 7} ${ballPos.y}, ${ballPos.x} ${ballPos.y + BALL_RADIUS}`}
              stroke="#000"
              strokeWidth="2"
              fill="none"
              style={{ pointerEvents: 'none' }}
            />
            <path
              d={`M ${ballPos.x} ${ballPos.y - BALL_RADIUS} Q ${ballPos.x - 7} ${ballPos.y}, ${ballPos.x} ${ballPos.y + BALL_RADIUS}`}
              stroke="#000"
              strokeWidth="2"
              fill="none"
              style={{ pointerEvents: 'none' }}
            />
            <ellipse
              cx={ballPos.x}
              cy={ballPos.y}
              rx={BALL_RADIUS}
              ry="7"
              stroke="#000"
              strokeWidth="2"
              fill="none"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        </svg>

        {/* Confetti Canvas - positioned above SVG */}
        {showConfetti && (
          <canvas
            ref={confettiCanvas}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          />
        )}

        {/* Score Display */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-base md:text-lg border-brutal" style={{ zIndex: 20 }}>
          Score: {score}
        </div>

        {/* Instructions */}
        {!isFlying && !isDragging && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-brutal-yellow px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm border-brutal shadow-brutal text-center max-w-[90%]" style={{ zIndex: 20 }}>
            Drag & release to shoot! 🏀
          </div>
        )}
      </div>

      {/* Reduced motion fallback */}
      {showConfetti && window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          <div className="text-4xl md:text-6xl font-black animate-pulse">🎉</div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}
