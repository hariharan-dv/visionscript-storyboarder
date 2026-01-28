
import React from 'react';
import { Panel, SceneMetadata, AspectRatio } from '../types';
import PanelItem from './PanelItem';
import { MapPin, Clock, Download, Share2 } from 'lucide-react';

interface StoryboardProps {
  panels: Panel[];
  metadata?: SceneMetadata;
  aspectRatio: AspectRatio;
  projectTitle: string;
}

const Storyboard: React.FC<StoryboardProps> = ({ panels, metadata, aspectRatio, projectTitle }) => {
  const downloadAll = () => {
    panels.forEach((panel) => {
      if (!panel.imageUrl) return;
      const link = document.createElement('a');
      link.href = panel.imageUrl;
      link.download = `${projectTitle.replace(/\s+/g, '_')}_Panel_${panel.panel_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Scene Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
        {metadata && (
          <div className="flex-1 flex flex-wrap items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</span>
              <div className="flex items-center gap-2 text-white">
                <MapPin size={16} className="text-indigo-400" />
                <span className="font-semibold">{metadata.location}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Time / Atmosphere</span>
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} className="text-indigo-400" />
                <span className="font-semibold">{metadata.time}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={downloadAll}
            disabled={panels.some(p => !p.imageUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all text-white"
          >
            <Download size={14} />
            Export Sequence
          </button>
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Grid of Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {panels.map((panel) => (
          <PanelItem 
            key={panel.panel_id} 
            panel={panel} 
            aspectRatio={aspectRatio}
            projectTitle={projectTitle}
          />
        ))}
      </div>
    </div>
  );
};

export default Storyboard;
