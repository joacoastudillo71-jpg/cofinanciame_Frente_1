import React from 'react';
import { Plus, Minus, Maximize } from 'lucide-react';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<Props> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="flex flex-col gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
      <button 
        onClick={onZoomIn}
        className="p-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors"
        aria-label="Acercar"
      >
        <Plus size={20} />
      </button>
      <button 
        onClick={onZoomOut}
        className="p-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors"
        aria-label="Alejar"
      >
        <Minus size={20} />
      </button>
      <button 
        onClick={onReset}
        className="p-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors"
        aria-label="Restablecer vista"
      >
        <Maximize size={20} />
      </button>
    </div>
  );
};