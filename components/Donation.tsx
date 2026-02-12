import React from 'react';
import { Link } from 'react-router-dom';

const Donation: React.FC = () => {
  return (
    <div className="min-h-screen bg-garden-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden">
        <div className="bg-primary/5 p-10 text-center border-b border-primary/10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <span className="material-symbols-outlined text-3xl">construction</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main mb-2">Under Construction</h1>
          <p className="text-text-main/70">The donation page is being built right now.</p>
        </div>

        <div className="p-10 text-center">
          <p className="text-text-main text-lg leading-relaxed">
            We are preparing secure donation options. Please check back soon.
          </p>
        </div>

        <div className="bg-background-light p-6 text-center border-t border-primary/10">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <span className="material-symbols-outlined">west</span>
             Return to Garden
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Donation;
