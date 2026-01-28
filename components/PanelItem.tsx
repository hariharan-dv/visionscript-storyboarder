
import React from 'react';
import { Panel, AspectRatio } from '../types';
import { Loader2, Fingerprint, Camera, Download } from 'lucide-react';

interface PanelItemProps {
  panel: Panel;
  aspectRatio: AspectRatio;
  projectTitle: string;
}

const PanelItem: React.FC<PanelItemProps> = ({ panel, aspectRatio, projectTitle }) => {
  const getRatioClass = () => {
    switch (aspectRatio) {
      case AspectRatio.ULTRAWIDE: return 'aspect-[2.39/1]';
      case AspectRatio.WIDESCREEN: return 'aspect-video';
      case AspectRatio.PORTRAIT: return 'aspect-[9/16]';
      default: return 'aspect-video';
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!panel.imageUrl) return;
    const link = document.createElement('a');
    link.href = panel.imageUrl;
    link.download = `${projectTitle.replace(/\s+/g, '_')}_Panel_${panel.panel_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all hover:border-zinc-700">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
        <span className="text-xs font-black text-indigo-500 uppercase">Panel {panel.panel_id.toString().padStart(2, '0')}</span>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
          <Camera size={12} />
          {panel.shot_type}
        </div>
      </div>

      <div className={`relative bg-zinc-950 overflow-hidden ${getRatioClass()}`}>
        {panel.imageUrl ? (
          <>
            <img 
              src={panel.imageUrl} 
              alt={`Panel ${panel.panel_id}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <button 
              onClick={handleDownload}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
              title="Download Image"
            >
              <Download size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span className="text-xs text-zinc-500 animate-pulse">Rendering shot...</span>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-[10px] text-zinc-300 line-clamp-3 italic leading-relaxed">
            "{panel.image_prompt}"
          </p>
        </div>
      </div>

      <div className="p-4 bg-zinc-900 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400 shrink-0">
            <Fingerprint size={14} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Continuity Check</h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {panel.continuity_focus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelItem;
