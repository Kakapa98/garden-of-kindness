import React, { useState } from 'react';
import { plantFlower, getKindnessSuggestion } from '../services/api';
import { MessageData } from '../types';

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const PlantModal: React.FC<PlantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [data, setData] = useState<MessageData>({ sender: '', recipient: '', content: '' });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    const suggestion = await getKindnessSuggestion();
    setData(prev => ({ ...prev, content: suggestion }));
    setIsAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStep('loading');
    
    try {
      const response = await plantFlower(data);
      const url = `${window.location.origin}${window.location.pathname}#/view/${response.token}`;
      setShareUrl(url);
      setStep('success');
      onSuccess(response.token);
    } catch (error) {
      console.error("Failed to plant", error);
      const fallback = "Unable to plant right now. Please try again.";
      const message = error instanceof Error ? error.message : fallback;
      setErrorMessage(message || fallback);
      setStep('form');
    }
  };

  const reset = () => {
    setStep('form');
    setData({ sender: '', recipient: '', content: '' });
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background-dark/20 backdrop-blur-sm animate-bloom">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col">
        
        {step === 'form' && (
          <>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-text-main">Plant a New Seed</h3>
                  <p className="text-primary font-medium mt-1">Fill this bud with your message.</p>
                </div>
                <button 
                  onClick={reset}
                  className="text-text-main/40 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl">cancel</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main block">From</label>
                    <input 
                      required
                      name="sender"
                      value={data.sender}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-primary/30 text-text-main" 
                      placeholder="Kind Soul" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main block">To</label>
                    <input 
                      required
                      name="recipient"
                      value={data.recipient}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-primary/30 text-text-main" 
                      placeholder="Who is this for?" 
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-text-main block">Kindness Message</label>
                  <textarea 
                    required
                    name="content"
                    value={data.content}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-primary/30 text-text-main resize-none" 
                    placeholder="Write something that will make them smile..." 
                    rows={4}
                  ></textarea>
                   <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    className="absolute bottom-3 right-3 text-xs font-bold bg-white text-primary px-3 py-1 rounded-md hover:bg-primary/5 border border-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">{isAiLoading ? 'hourglass_top' : 'auto_awesome'}</span>
                    {isAiLoading ? 'Thinking...' : 'AI Inspire'}
                  </button>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined">celebration</span>
                    Plant Your Kindness
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-primary/10 px-8 py-4 text-center">
              <p className="text-xs font-bold text-primary-dark uppercase tracking-tighter">Your flower will bloom instantly after planting</p>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse mb-6">
                <span className="material-symbols-outlined text-5xl text-primary animate-spin">local_florist</span>
             </div>
             <h3 className="text-2xl font-black text-text-main mb-2">Planting...</h3>
             <p className="text-primary/70">Nurturing your seed into a beautiful flower.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
             </div>
             <h3 className="text-2xl font-black text-text-main mb-2">It Bloomed!</h3>
             <p className="text-text-main/70 text-center mb-6">
               Your kindness is now part of the garden. <br/>
               <span className="text-primary font-bold">Copy this secure link to share it.</span>
             </p>
             
             <div className="w-full bg-background-light p-4 rounded-lg border border-primary/20 mb-4 break-all font-mono text-sm text-primary select-all">
                {shareUrl}
             </div>

             <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Link copied!");
              }}
              className="w-full bg-white text-primary font-bold py-3 rounded-xl border border-primary/30 hover:bg-primary/5 transition-colors mb-3 flex items-center justify-center gap-2"
             >
                <span className="material-symbols-outlined">content_copy</span>
                Copy Secure Link
             </button>
             
             <button onClick={reset} className="text-text-main/50 font-bold text-sm hover:text-primary">Close</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlantModal;
