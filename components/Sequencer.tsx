
import React, { useState, useEffect, useRef } from 'react';
import { Panel } from '../types';
import { X, Play, Pause, ChevronLeft, ChevronRight, FastForward, Download, Film, Loader2, CheckCircle2, FileText } from 'lucide-react';
// @ts-ignore
import gifshot from 'gifshot';

interface SequencerProps {
  panels: Panel[];
  onClose: () => void;
  projectTitle: string;
}

type Mode = 'Smooth' | 'Cinematic' | 'Dynamic';

interface GifOptions {
  images: (string | undefined)[];
  gifWidth: number;
  gifHeight: number;
  numWorkers: number;
  interval?: number;
  sampleInterval?: number;
  loop?: number;
}

const Sequencer: React.FC<SequencerProps> = ({ panels, onClose, projectTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<Mode>('Smooth');
  const [speed, setSpeed] = useState(2000); // ms per slide
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % panels.length);
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, panels.length, speed]);

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % panels.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + panels.length) % panels.length);

  const handleGenerateGif = () => {
    setIsGeneratingGif(true);
    setGifUrl(null);

    const gifOptions: GifOptions = {
      images: panels.map(p => p.imageUrl),
      gifWidth: 1280,
      gifHeight: 720,
      numWorkers: 2,
      loop: 1, // Set to 1 to prevent infinite looping as per user request
    };

    let finalOptions: GifOptions = { ...gifOptions };

    switch (mode) {
      case 'Smooth':
        finalOptions = { ...finalOptions, interval: 0.1, sampleInterval: 10 };
        break;
      case 'Cinematic':
        finalOptions = { ...finalOptions, interval: 0.8, sampleInterval: 5 };
        break;
      case 'Dynamic':
        finalOptions = { ...finalOptions, interval: 2, sampleInterval: 10 };
        break;
    }

    gifshot.createGIF(finalOptions, (obj: any) => {
      if (!obj.error) {
        setGifUrl(obj.image);
      } else {
        alert('GIF generation failed.');
      }
      setIsGeneratingGif(false);
    });
  };

  const downloadDescriptions = () => {
    const content = panels.map(p => 
      `PANEL ${p.panel_id}\n` +
      `Shot Type: ${p.shot_type}\n` +
      `Prompt: ${p.image_prompt}\n` +
      `Continuity Notes: ${p.continuity_focus}\n\n`
    ).join('------------------\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.replace(/\s+/g, '_')}_Shot_List.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadGif = () => {
    if (!gifUrl) return;
    const link = document.createElement('a');
    link.href = gifUrl;
    link.download = `${projectTitle.replace(/\s+/g, '_')}_${mode}.gif`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm tracking-widest uppercase">Sequence Master</span>
          <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            {(['Smooth', 'Cinematic', 'Dynamic'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setGifUrl(null); }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  mode === m ? 'bg-indigo-600 text-white' : 'text-zinc-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={downloadDescriptions}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold"
          >
            <FileText size={14} />
            Export TXT
          </button>

          {gifUrl ? (
            <button onClick={downloadGif} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg">
              <CheckCircle2 size={14} />
              Save GIF
            </button>
          ) : (
            <button 
              onClick={handleGenerateGif} 
              disabled={isGeneratingGif}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
            >
              {isGeneratingGif ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Render GIF
            </button>
          )}

          <div className="w-px h-6 bg-zinc-800 mx-2" />
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white"><X size={24} /></button>
        </div>
      </header>

      <div className="flex-1 relative flex items-center justify-center p-8 bg-zinc-950">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
          {panels.map((panel, idx) => (
            <div
              key={panel.panel_id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                currentIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img src={panel.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute top-8 left-8">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold tracking-widest text-white/70">
                  BEAT {panel.panel_id}
                </div>
              </div>
            </div>
          ))}
          
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={32}/></button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={32}/></button>
        </div>
      </div>

      <footer className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSpeed(Math.max(500, speed - 500))} className="p-2 bg-zinc-800 rounded-md"><FastForward size={16} className="rotate-180" /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={() => setSpeed(Math.min(5000, speed + 500))} className="p-2 bg-zinc-800 rounded-md"><FastForward size={16} /></button>
        </div>
        <div className="text-[10px] font-mono text-zinc-500">{speed / 1000}s INTERVAL</div>
      </footer>
    </div>
  );
};

export default Sequencer;
