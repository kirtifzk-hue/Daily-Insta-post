import React, { useRef, useState, useEffect } from 'react';
import { Download, RefreshCw, Edit2, Share2, Sparkles, Image as ImageIcon, Type, X, Check, Cpu, Zap, FileSpreadsheet, Image, Monitor, FileText, Video, Newspaper, Plus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { generatePostContent, generateBackgroundImage, type PostContent } from '../services/gemini';
import { cn } from '../lib/utils';

const THEMES = [
  { id: 'clean', name: 'Clean Instructional', class: 'bg-[#e5e7eb]' },
  { id: 'modern', name: 'Glassmorphism', class: 'bg-black/40 backdrop-blur-xl border border-white/10' },
  { id: 'solid', name: 'Solid Card', class: 'bg-white text-black shadow-xl' },
  { id: 'neon', name: 'Cyberpunk', class: 'bg-black/80 border-2 border-neon shadow-[0_0_20px_rgba(0,255,0,0.3)]' },
  { id: 'minimalist', name: 'Minimalist White', class: 'bg-white border border-neutral-200' },
  { id: 'futuristic', name: 'Dark Future', class: 'bg-slate-950 border border-cyan-500/30' },
];

const TOPICS = [
  { id: "Latest AI Tool", icon: Sparkles, color: "#8b5cf6", label: "AI TOOL" },
  { id: "Boost PC Performance", icon: Zap, color: "#eab308", label: "PC TRICK" },
  { id: "Excel Shortcut", icon: FileSpreadsheet, color: "#107c41", label: "MS EXCEL" },
  { id: "Photoshop Tip", icon: Image, color: "#31a8ff", label: "PHOTOSHOP" },
  { id: "Windows Hack", icon: Monitor, color: "#0078d4", label: "WINDOWS" },
  { id: "MS Word Trick", icon: FileText, color: "#2b579a", label: "MS WORD" },
  { id: "After Effects", icon: Video, color: "#9999ff", label: "AFTER EFFECTS" },
  { id: "Tech News", icon: Newspaper, color: "#f43f5e", label: "TECH NEWS" },
];

export default function PostGenerator() {
  const [content, setContent] = useState<PostContent | null>(null);
  const [bgImage, setBgImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[2]); // Default to Excel for demo
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [isEditing, setIsEditing] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const getHistory = () => {
    try {
      return JSON.parse(localStorage.getItem('instatech_history') || '[]');
    } catch {
      return [];
    }
  };

  const addToHistory = (item: string) => {
    const hist = getHistory();
    if (!hist.includes(item)) {
      const newHist = [item, ...hist].slice(0, 50); // Keep last 50
      localStorage.setItem('instatech_history', JSON.stringify(newHist));
    }
  };

  // Initial load
  useEffect(() => {
    handleGenerateFull();
  }, []);

  const handleGenerateFull = async () => {
    setLoading(true);
    setLoadingImg(true);
    setIsEditing(false);
    try {
      const hist = getHistory();
      const newContent = await generatePostContent(selectedTopic.id, hist);
      setContent(newContent);
      addToHistory(newContent.shortcutAction || newContent.headline);
      
      // Only generate background image if NOT in clean/minimalist mode
      if (currentTheme.id !== 'clean' && currentTheme.id !== 'minimalist') {
        generateBackgroundImage(newContent.topic, newContent.headline)
          .then(img => {
              if (img) setBgImage(img);
              setLoadingImg(false);
          })
          .catch(() => setLoadingImg(false));
      } else {
        setLoadingImg(false);
      }

    } catch (e) {
      console.error(e);
      setLoadingImg(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateText = async () => {
    setLoading(true);
    setIsEditing(false);
    try {
      const hist = getHistory();
      const newContent = await generatePostContent(selectedTopic.id, hist);
      setContent(newContent);
      addToHistory(newContent.shortcutAction || newContent.headline);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!content) return;
    setLoadingImg(true);
    try {
      const img = await generateBackgroundImage(content.topic, content.headline);
      if (img) setBgImage(img);
    } finally {
      setLoadingImg(false);
    }
  };

  const handleDownload = async () => {
    if (!postRef.current) return;
    try {
      const dataUrl = await toPng(postRef.current, { cacheBust: true, pixelRatio: 2.5 });
      const link = document.createElement('a');
      link.download = `instatech-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const updateContent = (field: keyof PostContent, value: any) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  const TopicIcon = selectedTopic.icon;

  // Render Key Component
  const KeyCap = ({ k }: { k: string }) => (
    <div className="relative group">
      <div className="h-12 min-w-[56px] px-3 bg-black rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center border-b-4 border-neutral-900 transform transition-transform active:translate-y-1 active:shadow-none">
        <span className={cn("font-bold text-white font-sans whitespace-nowrap", k.length > 5 ? "text-base" : "text-lg")}>{k}</span>
      </div>
    </div>
  );

  // Red Footer Text Component
  const RedFooterText = () => (
      <p className="text-[#ff0000] font-bold text-lg tracking-wide drop-shadow-sm">Follow / LIKE/ Share for more</p>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col lg:grid lg:grid-cols-[380px_1fr] gap-8 min-h-[100dvh] lg:h-[100dvh]">
        
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6 lg:h-full lg:overflow-y-auto pb-8 lg:pb-0 lg:pr-2 custom-scrollbar order-2 lg:order-1">
          <div className="space-y-2 shrink-0">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              InstaTech Daily
            </h1>
            <p className="text-sm text-neutral-400">
              Pro Social Media Generator
            </p>
          </div>

          {!isEditing ? (
            <>
              {/* Topic Selector */}
              <div className="space-y-3 shrink-0">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Topic</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map(topic => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className={cn(
                          "px-3 py-3 text-xs text-left rounded-xl border transition-all flex items-center gap-2 group",
                          selectedTopic.id === topic.id 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", selectedTopic.id === topic.id ? "text-white" : "text-neutral-500 group-hover:text-white")} />
                        <span className="truncate">{topic.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 shrink-0">
                 <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Generate</label>
                 <button
                    onClick={handleGenerateFull}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Generate Magic Post
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRegenerateText}
                      disabled={loading}
                      className="py-3 bg-neutral-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors border border-neutral-700"
                    >
                      <Type className="w-4 h-4" />
                      Remix Text
                    </button>
                    <button
                      onClick={handleRegenerateImage}
                      disabled={loadingImg}
                      className="py-3 bg-neutral-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors border border-neutral-700"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {loadingImg ? 'Generating...' : 'New Image'}
                    </button>
                  </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Theme</label>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Content
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setCurrentTheme(theme)}
                      className={cn(
                        "px-3 py-3 text-xs rounded-xl border transition-all flex items-center gap-2",
                        currentTheme.id === theme.id
                          ? "bg-neutral-800 border-neutral-600 text-white shadow-md" 
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:bg-neutral-800"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", theme.id === 'neon' ? 'bg-green-400' : 'bg-white')} />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
               <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Content
                  </h3>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-1 hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-xs text-neutral-500 uppercase font-semibold mb-1 block">Headline</label>
                   <textarea 
                      value={content?.headline || ''}
                      onChange={(e) => updateContent('headline', e.target.value)}
                      className="w-full bg-black/40 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-none"
                   />
                 </div>
                 {content?.isShortcut && (
                   <>
                     <div>
                       <label className="text-xs text-neutral-500 uppercase font-semibold mb-1 block">Shortcut Action</label>
                       <input 
                          value={content?.shortcutAction || ''}
                          onChange={(e) => updateContent('shortcutAction', e.target.value)}
                          className="w-full bg-black/40 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       />
                     </div>
                     <div>
                       <label className="text-xs text-neutral-500 uppercase font-semibold mb-1 block">Keys (comma separated)</label>
                       <input 
                          value={content?.shortcutKeys?.join(',') || ''}
                          onChange={(e) => updateContent('shortcutKeys', e.target.value.split(','))}
                          className="w-full bg-black/40 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       />
                     </div>
                   </>
                 )}
                 <div>
                   <label className="text-xs text-neutral-500 uppercase font-semibold mb-1 block">Body</label>
                   <textarea 
                      value={content?.body || ''}
                      onChange={(e) => updateContent('body', e.target.value)}
                      className="w-full bg-black/40 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px] resize-none"
                   />
                 </div>
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                 >
                   <Check className="w-4 h-4" />
                   Save Changes
                 </button>
               </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-neutral-800 shrink-0">
             <button
                onClick={handleDownload}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20"
              >
                <Download className="w-5 h-5" />
                Download High-Res Post
              </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex items-start lg:items-center justify-center bg-neutral-900/50 rounded-3xl border border-white/5 p-4 sm:p-8 overflow-hidden relative min-h-[480px] lg:min-h-0 order-1 lg:order-2 w-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />
            
            {/* Scaler Wrapper for Mobile */}
            <div className="transform scale-[0.75] sm:scale-90 lg:scale-100 origin-top lg:origin-center transition-transform">
              {/* The Post Canvas */}
              <div 
                ref={postRef}
              className="relative w-[432px] h-[540px] shadow-2xl overflow-hidden flex flex-col shrink-0"
              style={{
                backgroundColor: (currentTheme.id === 'clean' || currentTheme.id === 'minimalist') ? '#ffffff' : '#000000',
              }}
            >
              {/* Background Layer */}
              <div className="absolute inset-0" style={{ backgroundColor: (currentTheme.id === 'clean' || currentTheme.id === 'minimalist') ? '#ffffff' : '#000000' }}>
                 {currentTheme.id !== 'clean' && currentTheme.id !== 'minimalist' && bgImage ? (
                   <img 
                    src={bgImage} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-90"
                    crossOrigin="anonymous"
                   />
                 ) : (currentTheme.id !== 'clean' && currentTheme.id !== 'minimalist') ? (
                   <div 
                     className="w-full h-full"
                     style={{
                       background: currentTheme.id === 'futuristic' 
                        ? `radial-gradient(circle at 50% 0%, ${selectedTopic.color}40 0%, #020617 70%)`
                        : `linear-gradient(135deg, ${selectedTopic.color}20 0%, #000000 100%)`
                     }} 
                   />
                 ) : null}
                 
                 {/* Overlays for non-clean/minimalist themes */}
                 {currentTheme.id !== 'clean' && currentTheme.id !== 'minimalist' && (
                   <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.8) 100%)'
                      }}
                    />
                    {currentTheme.id === 'futuristic' && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                          backgroundSize: '40px 40px'
                        }}
                      />
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                      }}
                    />
                   </>
                 )}
              </div>

              {/* Content Layer */}
              <div className="relative z-10 h-full flex flex-col p-8">
                
                {/* CLEAN THEME LAYOUT (Matches User Request) */}
                {currentTheme.id === 'clean' ? (
                  <div className="h-full flex flex-col relative p-4">
                    {/* Main Centered Content */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 z-10 w-full">
                      {/* Top Header */}
                      <div className="text-center pt-2">
                         <h2 className="text-[22px] font-medium text-neutral-900 font-sans">
                           Shortcut of <span className="font-black border-b-[3px] pb-1" style={{ color: selectedTopic.color, borderColor: selectedTopic.color }}>{selectedTopic.label}</span>
                         </h2>
                      </div>

                      <div className="text-center -mt-1">
                         <p className="text-2xl italic font-serif text-neutral-600">to</p>
                      </div>

                      {/* Action Button */}
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center w-full px-6 mt-1"
                      >
                        <div 
                          className="w-full py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] text-[20px] leading-snug font-bold text-white tracking-wide flex items-center justify-center px-4 text-center"
                          style={{ backgroundColor: selectedTopic.color }}
                        >
                          {content?.shortcutAction || content?.headline || "Total / Sum"}
                        </div>
                      </motion.div>

                      {/* Keys Display */}
                      <div className="flex flex-wrap items-center justify-center gap-2 w-full px-2 mt-2">
                        {content?.shortcutKeys && content.shortcutKeys.length > 0 && (
                          content.shortcutKeys.map((key, i) => (
                            <React.Fragment key={i}>
                              <div className="shrink-0">
                                <KeyCap k={key} />
                              </div>
                              {i < content.shortcutKeys!.length - 1 && (
                                <div className="shrink-0">
                                  <Plus className="w-6 h-6" style={{ color: selectedTopic.color, strokeWidth: 4 }} />
                                </div>
                              )}
                            </React.Fragment>
                          ))
                        )}
                      </div>
                      
                      {/* Short Detail Below Shortcut */}
                      <div className="px-5 py-4 mt-2 rounded-3xl bg-white border border-black text-justify w-full max-w-[92%]">
                        <p className="text-[15px] text-black font-bold leading-snug">{content?.body}</p>
                      </div>
                    </div>

                    {/* Footer Section (Red Text + Branding) */}
                    <div className="mt-auto w-full flex flex-col items-center gap-3 z-20 pt-4">
                        {/* Red Text Line */}
                        <RedFooterText />

                        {/* Footer Branding */}
                        <div className="w-full flex justify-end opacity-40">
                           <div className="flex flex-col items-end">
                              <TopicIcon className="w-6 h-6 mb-1 text-neutral-400" />
                              <span className="text-[10px] font-bold text-neutral-400 tracking-widest">@INSTATECH</span>
                           </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  // OTHER THEMES (Modern, Neon, etc.)
                  <div className="h-full flex flex-col relative">
                    {/* Header */}
                    <div className="flex justify-between items-center pt-6 px-4 shrink-0 z-20">
                      <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            <TopicIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>Daily Tips</span>
                            <span className="text-sm font-bold tracking-wide text-white">InstaTech</span>
                          </div>
                      </div>
                      <div 
                        className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#ffffff'
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: selectedTopic.color }} />
                        {content?.topic || 'Tech Tip'}
                      </div>
                    </div>

                    {/* Main Content - Flex Grow */}
                    <div className="flex-1 flex flex-col justify-center relative px-4 py-4 z-10">
                      {/* Decorative Elements */}
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-1 h-32 rounded-r-full" style={{ backgroundColor: selectedTopic.color, opacity: 0.8 }} />
                      
                      <AnimatePresence mode="wait">
                        {content ? (
                          <motion.div
                            key={content.headline + (isEditing ? 'edit' : '')}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={cn(
                              "p-6 rounded-3xl relative overflow-hidden group",
                            )}
                            style={{
                                backgroundColor: currentTheme.id === 'modern' ? 'rgba(20,20,20,0.6)' : 
                                              currentTheme.id === 'solid' ? '#ffffff' : 
                                              currentTheme.id === 'neon' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
                                backdropFilter: currentTheme.id === 'modern' ? 'blur(40px) saturate(180%)' : 'blur(10px)',
                                border: currentTheme.id === 'modern' ? '1px solid rgba(255,255,255,0.1)' : 
                                        currentTheme.id === 'neon' ? `2px solid ${selectedTopic.color}` : '1px solid rgba(255,255,255,0.05)',
                                boxShadow: currentTheme.id === 'solid' ? '0 20px 40px rgba(0,0,0,0.2)' : 
                                          currentTheme.id === 'neon' ? `0 0 30px ${selectedTopic.color}40` : '0 10px 30px rgba(0,0,0,0.2)'
                            }}
                          >
                              {/* Inner Glow for Modern Theme */}
                              {currentTheme.id === 'modern' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                              )}

                              <h2 
                                className="text-3xl font-black leading-[1.1] mb-4 tracking-tight"
                                style={{ 
                                  color: currentTheme.id === 'solid' ? '#111111' : '#ffffff',
                                  textShadow: currentTheme.id === 'neon' ? `0 0 20px ${selectedTopic.color}` : '0 2px 10px rgba(0,0,0,0.2)'
                                }}
                              >
                                {content.headline}
                              </h2>
                              
                              <div className="w-10 h-1 mb-4 rounded-full" style={{ backgroundColor: selectedTopic.color }} />

                              {content.shortcutKeys && content.shortcutKeys.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                  {content.shortcutKeys.map((key, i) => (
                                    <React.Fragment key={i}>
                                      <KeyCap k={key} />
                                      {i < content.shortcutKeys!.length - 1 && (
                                        <Plus className="w-5 h-5 text-white/50" />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}

                              <p 
                                className="text-lg font-bold leading-relaxed whitespace-pre-wrap"
                                style={{ color: currentTheme.id === 'solid' ? '#4b5563' : 'rgba(255,255,255,0.9)' }}
                              >
                                {content.body}
                              </p>
                          </motion.div>
                        ) : (
                          <div className="space-y-6 animate-pulse">
                            <div className="h-12 rounded-xl w-3/4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            <div className="h-40 rounded-2xl w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer Section - Shrink 0 */}
                    <div className="shrink-0 w-full flex flex-col gap-4 pb-6 px-4 z-20">
                        {/* Red Text Line */}
                        <div className="w-full text-center">
                            <RedFooterText />
                        </div>

                        {/* Footer Info */}
                        <div className="pt-2">
                          <div className="flex flex-wrap gap-2 mb-4 justify-center">
                              {content?.tags.map((tag, i) => (
                                <span 
                                  key={i} 
                                  className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider" 
                                  style={{ 
                                    backgroundColor: (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                                    color: (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? '#000000' : '#ffffff',
                                    border: (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                          
                          <div 
                            className="flex items-center justify-between pt-4" 
                            style={{ borderTop: (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.15)' }}
                          >
                              <div className="flex items-center gap-2">
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? "bg-neutral-100" : "bg-white")}>
                                  <TopicIcon className="w-3 h-3" style={{ color: selectedTopic.color }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: (currentTheme.id === 'minimalist' || currentTheme.id === 'solid') ? '#000000' : '#ffffff' }}>@InstaTechDaily</span>
                              </div>
                              
                              <div 
                                className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                                style={{ 
                                  backgroundColor: selectedTopic.color,
                                  color: '#000000',
                                  boxShadow: `0 4px 12px ${selectedTopic.color}60`
                                }}
                              >
                                {content?.footer || 'Save for later'}
                                <Share2 className="w-3 h-3" />
                              </div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}
