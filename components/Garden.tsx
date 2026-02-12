import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Flower from './Flower';
import PlantModal from './PlantModal';
import { getPublicFlowers } from '../services/api';
import { PublicFlower } from '../types';

const Garden: React.FC = () => {
  const [flowers, setFlowers] = useState<PublicFlower[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshFlowers = async () => {
    const data = await getPublicFlowers();
    setFlowers(data);
  };

  useEffect(() => {
    refreshFlowers();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/10 px-6 md:px-20 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">local_florist</span>
          </div>
          <h1 className="text-text-main text-xl font-extrabold leading-tight tracking-tight">Garden of Kindness</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-text-main text-sm font-semibold hover:text-primary transition-colors">The Meadow</Link>
            <Link to="/donate" className="text-text-main text-sm font-semibold hover:text-primary transition-colors">Donate</Link>
          </nav>
          <div className="flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <span className="material-symbols-outlined text-sm mr-2 text-primary">favorite</span>
            <span className="text-xs font-bold text-primary">{flowers.length} Bloomed</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="relative w-full py-12 px-6 md:px-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-text-main leading-[1.1] tracking-tight">
              Watch the World Bloom <br/><span className="text-primary">One Kind Note at a Time.</span>
            </h2>
            <p className="text-lg text-primary/70 font-medium max-w-2xl mx-auto leading-relaxed">
              Choose to plant a seed below, write a message of appreciation, and watch your kindness take root and flourish in our public digital garden.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 transform active:scale-95"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Start Planting
              </button>
            </div>
          </div>
        </div>

        {/* The Garden Canvas */}
        <div className="garden-bg relative flex-1 min-h-[600px] w-full overflow-hidden px-6 md:px-20 pb-20 border-t border-primary/5">
          {/* Abstract Garden Layers */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/10 to-transparent"></div>
          </div>

          {/* Flowers Layer - Absolute positioning for 'organic' feel */}
          <div className="absolute inset-0 w-full h-full max-w-[1400px] mx-auto">
             {flowers.length === 0 && (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center opacity-40">
                 <span className="material-symbols-outlined text-6xl text-primary mb-2">yard</span>
                 <p className="font-bold text-primary">The garden is waiting for your first seed.</p>
               </div>
             )}
             {flowers.map((flower) => (
              <Flower 
                key={flower.id} 
                data={flower} 
                className="hover:z-10 transition-all"
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary/10 py-10 px-6 md:px-20 z-10 relative">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-6 text-primary">
              <span className="material-symbols-outlined">local_florist</span>
            </div>
            <p className="text-sm font-bold text-text-main">
              Built in 2026 by Kahuna (M.P.H.O) •{" "}
              <a
                href="https://github.com/Kakapa98"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                github/Kakapa98
              </a>
            </p>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">Privacy</Link>
            <Link to="/" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">Terms</Link>
            <Link to="/donate" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">Support Us</Link>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Stat */}
      <div className="fixed bottom-8 left-8 hidden lg:block z-40">
        <div className="bg-white rounded-xl shadow-xl border border-primary/20 p-5 flex flex-col gap-1 max-w-[200px]">
          <p className="text-text-main text-xs font-bold uppercase tracking-widest opacity-60">Today's Blooms</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-text-main">{flowers.length + 2}</span>
            <span className="text-sm font-bold text-primary">+2%</span>
          </div>
          <div className="w-full bg-background-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PlantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          refreshFlowers();
        }}
      />
    </div>
  );
};

export default Garden;
