
import React from 'react';
import { Project } from '../types';
import { Layers, Plus, Film, Clock, ChevronRight, Trash2 } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, activeId, onSelect, onCreate, onDelete }) => {
  return (
    <aside className="w-72 border-r border-zinc-800 bg-[#0d0d0d] flex flex-col shrink-0">
      <div className="h-16 px-6 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
          <Film size={18} className="text-white" />
        </div>
        <span className="font-bold tracking-tight text-lg">VisionScript</span>
      </div>

      <div className="px-4 mt-4">
        <button 
          onClick={onCreate}
          className="w-full py-3 px-4 flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 group"
        >
          <span className="font-semibold text-sm">New Project</span>
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-8 px-2 space-y-1 custom-scrollbar">
        <div className="px-4 mb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Clock size={12} />
          History
        </div>
        
        {projects.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-zinc-600 italic">No boards created yet.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="relative group">
              <button
                onClick={() => onSelect(project.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  activeId === project.id 
                  ? 'bg-zinc-800/80 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className={`p-2 rounded-md ${activeId === project.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-600 group-hover:text-zinc-400'}`}>
                  <Layers size={14} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-medium truncate">{project.title}</p>
                  <p className="text-[10px] opacity-60">
                    {project.panels.length} panels • {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {activeId === project.id && <ChevronRight size={14} className="text-indigo-400" />}
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Project"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${projects.length}`} className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800" alt="Avatar" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Senior Director</p>
            <p className="text-[10px] text-zinc-500">{projects.length} Saved Boards</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
