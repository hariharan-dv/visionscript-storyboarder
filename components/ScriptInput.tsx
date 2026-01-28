
import React, { useState } from 'react';
import { StylePreset, AspectRatio } from '../types';
import { Wand2, Car, Maximize, Palette, FileText, Loader2 } from 'lucide-react';

interface ScriptInputProps {
  initialScript: string;
  initialHero: string;
  initialStyle: StylePreset;
  initialRatio: AspectRatio;
  onProcess: (script: string, hero: string, style: StylePreset, ratio: AspectRatio) => void;
  isLoading: boolean;
}

const ScriptInput: React.FC<ScriptInputProps> = ({
  initialScript,
  initialHero,
  initialStyle,
  initialRatio,
  onProcess,
  isLoading
}) => {
  const [script, setScript] = useState(initialScript);
  const [hero, setHero] = useState(initialHero);
  const [style, setStyle] = useState(initialStyle);
  const [ratio, setRatio] = useState(initialRatio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess(script, hero, style, ratio);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col h-full overflow-y-auto space-y-8 bg-zinc-900/20 custom-scrollbar">
      <section className="space-y-4 shrink-0">
        <div className="flex items-center gap-2 text-indigo-400">
          <FileText size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Screenplay Segment</h3>
        </div>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700 resize-none"
          placeholder="INT. CHAMBER - DAY..."
        />
      </section>

      <section className="space-y-4 shrink-0">
        <div className="flex items-center gap-2 text-indigo-400">
          <Car size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Hero Asset DNA</h3>
        </div>
        <input
          type="text"
          value={hero}
          onChange={(e) => setHero(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Visual traits to lock..."
        />
        <p className="text-[10px] text-zinc-500 italic">Locked features across all 4 panels.</p>
      </section>

      <section className="grid grid-cols-2 gap-4 shrink-0">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">
            <Palette size={12} /> Visual Style
          </label>
          <select 
            value={style}
            onChange={(e) => setStyle(e.target.value as StylePreset)}
            className="w-full bg-zinc-800 border-none rounded-lg p-2.5 text-xs outline-none"
          >
            {Object.values(StylePreset).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">
            <Maximize size={12} /> Aspect Ratio
          </label>
          <select 
            value={ratio}
            onChange={(e) => setRatio(e.target.value as AspectRatio)}
            className="w-full bg-zinc-800 border-none rounded-lg p-2.5 text-xs outline-none"
          >
            {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </section>

      <div className="pt-6 pb-2 shrink-0">
        <button
          type="submit"
          disabled={isLoading || !script.trim() || !hero.trim()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-900/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
          <span>{isLoading ? "Analyzing..." : "Generate Panels"}</span>
        </button>
      </div>
    </form>
  );
};

export default ScriptInput;
