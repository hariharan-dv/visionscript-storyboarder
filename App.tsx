
import React, { useState, useEffect } from 'react';
import { Project, StylePreset, AspectRatio, Panel } from './types';
import { parseScriptToPanels, generatePanelImage } from './services/gemini';
import Sidebar from './components/Sidebar';
import ScriptInput from './components/ScriptInput';
import Storyboard from './components/Storyboard';
import Sequencer from './components/Sequencer';
import { Play, Plus, BookOpen, Layers, Settings2, Sparkles, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'visionscript_projects_v2';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSequencing, setIsSequencing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createNewProject = () => {
    const newId = crypto.randomUUID();
    const newProject: Project = {
      id: newId,
      title: 'Untitled Storyboard',
      script: '',
      heroAsset: '',
      style: StylePreset.CINEMATIC,
      aspectRatio: AspectRatio.WIDESCREEN,
      panels: [],
      createdAt: Date.now()
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newId);
  };

  const deleteProject = (id: string) => {
    if (confirm('Delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleProcessScript = async (script: string, hero: string, style: StylePreset, ratio: AspectRatio) => {
    if (!activeProjectId) return;
    setIsProcessing(true);
    
    try {
      const { metadata, panels } = await parseScriptToPanels(script, style, hero);
      
      const initializedPanels = panels.map(p => ({
        ...p,
        isGenerating: true
      }));

      updateProject(activeProjectId, {
        script,
        heroAsset: hero,
        style,
        aspectRatio: ratio,
        metadata,
        panels: initializedPanels
      });

      let previousImage: string | undefined = undefined;

      // SEQUENTIAL GENERATION FOR CONTINUITY
      for (let i = 0; i < initializedPanels.length; i++) {
        const panel = initializedPanels[i];
        try {
          // Pass previous image as visual DNA reference
          const imageUrl = await generatePanelImage(panel.image_prompt, ratio, previousImage);
          previousImage = imageUrl;
          
          setProjects(prev => prev.map(proj => {
            if (proj.id === activeProjectId) {
              const updatedPanels = proj.panels.map(p => 
                p.panel_id === panel.panel_id ? { ...p, imageUrl, isGenerating: false } : p
              );
              return { ...proj, panels: updatedPanels };
            }
            return proj;
          }));
        } catch (err) {
          console.error(`Error generating panel ${panel.panel_id}:`, err);
        }
      }
    } catch (error) {
      console.error("Failed to process script:", error);
      alert("Error analyzing script.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden">
      <Sidebar 
        projects={projects} 
        activeId={activeProjectId} 
        onSelect={setActiveProjectId} 
        onCreate={createNewProject}
        onDelete={deleteProject}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProject ? (
          <>
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <input 
                  type="text" 
                  value={activeProject.title}
                  onChange={(e) => updateProject(activeProject.id, { title: e.target.value })}
                  className="bg-transparent font-semibold text-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 px-2 py-1 rounded transition-all"
                  placeholder="New Storyboard"
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSequencing(true)}
                  disabled={activeProject.panels.length === 0 || activeProject.panels.some(p => !p.imageUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm font-medium transition-colors"
                >
                  <Play size={16} fill="currentColor" />
                  Preview sequence
                </button>
                <button 
                  onClick={() => alert("Project Preferences: Settings updated.")}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <Settings2 size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
              <div className="w-full lg:w-1/3 border-r border-zinc-800 flex flex-col h-full bg-zinc-900/20 overflow-hidden">
                <ScriptInput 
                  initialScript={activeProject.script}
                  initialHero={activeProject.heroAsset}
                  initialStyle={activeProject.style}
                  initialRatio={activeProject.aspectRatio}
                  onProcess={handleProcessScript}
                  isLoading={isProcessing}
                />
              </div>

              <div className="flex-1 h-full overflow-y-auto bg-zinc-950 p-8 custom-scrollbar">
                {activeProject.panels.some(p => p.imageUrl || p.isGenerating) ? (
                  <Storyboard 
                    panels={activeProject.panels} 
                    metadata={activeProject.metadata}
                    aspectRatio={activeProject.aspectRatio}
                    projectTitle={activeProject.title}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 max-w-md mx-auto text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <BookOpen size={32} className="opacity-20" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-zinc-300 mb-2">Ready to Visualize</h3>
                      <p className="text-sm">Input your script and define your "Hero Asset" above. The panels section will appear once generation begins.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-12">
            <div className="relative group cursor-pointer" onClick={createNewProject}>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-72 h-48 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 transition-transform hover:-translate-y-1">
                <Plus size={48} className="text-zinc-600" />
                <span className="text-zinc-400 font-medium">New VisionScript</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {isSequencing && activeProject && (
        <Sequencer 
          panels={activeProject.panels.filter(p => !!p.imageUrl)} 
          onClose={() => setIsSequencing(false)} 
          projectTitle={activeProject.title}
        />
      )}
    </div>
  );
};

export default App;
