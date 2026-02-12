import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessageByToken } from '../services/api';
import { MessageViewData } from '../types';
import Flower from './Flower';

const ViewMessage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  
  const [data, setData] = useState<MessageViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const fetchMsg = async () => {
      try {
        const msg = await getMessageByToken(token);
        if (msg) {
          setData(msg);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMsg();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <span className="material-symbols-outlined text-5xl text-primary">local_florist</span>
           <span className="font-bold text-primary">Blooming...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-garden-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-gray-400">withered_flower</span>
        </div>
        <h1 className="text-4xl font-black text-text-main mb-4">Flower Not Found</h1>
        <p className="text-text-main/70 mb-8 max-w-md">This flower might have withered away or the link is incorrect.</p>
        <Link to="/" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors">Return to Garden</Link>
      </div>
    );
  }

  // Helper to render static SVG for the card header without the full Flower component logic
  const renderHeaderFlower = () => {
    const type = data.flower.type;
    const petalCount = type === 1 ? 8 : type === 2 ? 12 : 16;
    const petalLength = type === 1 ? 28 : type === 2 ? 24 : 26;
    const petalWidth = type === 1 ? 12 : type === 2 ? 8 : 5;
    const ry = petalLength / 2;
    const cy = 50 - ry + 5;

    return (
        <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-sm overflow-visible" style={{ color: data.flower.color }}>
            <g className="origin-center animate-[spin_10s_linear_infinite]">
            {Array.from({ length: petalCount }).map((_, i) => (
                <ellipse
                    key={i}
                    cx="50"
                    cy={cy}
                    rx={petalWidth}
                    ry={ry}
                    fill="currentColor"
                    transform={`rotate(${(360 / petalCount) * i} 50 50)`}
                />
            ))}
            </g>
            <circle cx="50" cy="50" r={12} fill="#fbbf24" />
            <circle cx="46" cy="46" r="3" fill="white" fillOpacity="0.3" />
        </svg>
    );
  };

  return (
    <div className="min-h-screen bg-garden-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
      
      {/* Background Flowers */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Flower data={{...data.flower, x: 10, y: 10, scale: 2}} />
        <Flower data={{...data.flower, x: 85, y: 80, scale: 1.5}} />
        <Flower data={{...data.flower, x: 75, y: 15, scale: 1.2}} />
        <Flower data={{...data.flower, x: 15, y: 70, scale: 1.8}} />
      </div>

      <div className="relative w-full max-w-[600px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-primary/10 overflow-hidden transform transition-all hover:scale-[1.01]">
        
        {/* Card Header with Icon */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center border-b border-primary/10">
           <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-md mb-4 animate-float">
              {renderHeaderFlower()}
           </div>
           <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">A Message For</h2>
           <h1 className="text-3xl md:text-4xl font-black text-text-main">{data.recipient}</h1>
        </div>

        {/* Message Body */}
        <div className="p-8 md:p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-primary/20 mb-4 block">format_quote</span>
          <p className="text-xl md:text-2xl text-text-main font-medium leading-relaxed italic mb-8">
            {data.content}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-text-main/60">
             <span className="text-xs font-bold uppercase tracking-widest">Sent By</span>
          </div>
          <p className="text-xl font-bold text-primary mt-2">{data.sender}</p>
        </div>

        {/* Footer */}
        <div className="bg-background-light p-6 text-center border-t border-primary/10">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-bold transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Visit the Garden</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewMessage;