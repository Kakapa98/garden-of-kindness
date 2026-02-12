import React from 'react';
import { PublicFlower } from '../types';

interface FlowerProps {
  data: PublicFlower;
  onClick?: () => void;
  className?: string;
}

const Flower: React.FC<FlowerProps> = ({ data, onClick, className }) => {
  const { x, y, color, scale, type } = data;

  const style: React.CSSProperties = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `scale(${scale})`,
    position: 'absolute',
    cursor: onClick ? 'pointer' : 'default',
    zIndex: Math.floor(y), // Simple depth sorting
    color: color, // Set text color to data color for currentColor usage
  };

  const renderPetals = () => {
    // Different daisy variations based on type
    const petalCount = type === 1 ? 8 : type === 2 ? 12 : 16;
    const petalLength = type === 1 ? 28 : type === 2 ? 24 : 26;
    const petalWidth = type === 1 ? 12 : type === 2 ? 8 : 5;
    
    // Adjust y position so petals radiate from center (50,50)
    // cy + ry should be approx 50 minus a small overlap
    const ry = petalLength / 2;
    const cy = 50 - ry + 5; // +5 overlap into center

    return Array.from({ length: petalCount }).map((_, i) => (
      <ellipse
        key={i}
        cx="50"
        cy={cy}
        rx={petalWidth}
        ry={ry}
        fill="currentColor"
        transform={`rotate(${(360 / petalCount) * i} 50 50)`}
        className="opacity-90 hover:opacity-100 transition-opacity"
      />
    ));
  };

  return (
    <div 
      className={`group flex flex-col items-center justify-end h-40 w-32 animate-float origin-bottom ${className || ''}`} 
      style={style}
      onClick={onClick}
    >
      <div className="relative transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2">
        <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-sm overflow-visible">
          {/* Petals Group */}
          <g className="origin-center hover:animate-[spin_4s_linear_infinite]">
             {renderPetals()}
          </g>
          
          {/* Center Disk */}
          <circle cx="50" cy="50" r={type === 3 ? 10 : 12} fill="#fbbf24" className="drop-shadow-sm" />
          <circle cx="46" cy="46" r="3" fill="white" fillOpacity="0.3" />
        </svg>
      </div>
      
      {/* Stem */}
      <div className="relative flex flex-col items-center -mt-2">
         <div className="w-1.5 h-16 bg-green-400/80 rounded-full"></div>
         
         {/* Leaves */}
         <div className="absolute top-6 w-16 h-8 flex justify-between pointer-events-none">
             <div className="w-6 h-6 bg-green-400/80 rounded-tr-[20px] rounded-bl-[20px] transform -rotate-45 translate-x-2"></div>
             <div className="w-6 h-6 bg-green-400/80 rounded-tl-[20px] rounded-br-[20px] transform rotate-45 -translate-x-2"></div>
         </div>
      </div>
    </div>
  );
};

export default Flower;