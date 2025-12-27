
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './components/Button';
import { generateStoryText, generateSceneImage, generateNarration, decodeAudio } from './services/geminiService';
import { CULTURAL_ARCHIVE } from './services/culturalArchive';
import { Story, GenerationStatus, AppTab } from './types';
import { 
  Sparkles, MapPin, Users, ScrollText, 
  Award, Heart, Volume2, ChevronDown, ChevronUp, 
  Share2, ArrowLeft, Sun, Music, ShieldCheck, PauseCircle, Loader2,
  Landmark, BookOpen, Flame, Mic2, Compass
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [selectedEthnicGroup, setSelectedEthnicGroup] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [aiStories, setAiStories] = useState<Story[]>([]);
  const [showInvocator, setShowInvocator] = useState(false);
  
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('fav_stories') || '[]'));
  const [readStories, setReadStories] = useState<string[]>(() => JSON.parse(localStorage.getItem('read_stories') || '[]'));

  useEffect(() => {
    localStorage.setItem('fav_stories', JSON.stringify(favorites));
    localStorage.setItem('read_stories', JSON.stringify(readStories));
  }, [favorites, readStories]);

  const allStories = useMemo(() => [...CULTURAL_ARCHIVE, ...aiStories], [aiStories]);

  const ethnicGroupsList = useMemo(() => {
    return Array.from(new Set(allStories.map(s => s.ethnicGroup).filter(Boolean))) as string[];
  }, [allStories]);

  const filteredStories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allStories.filter(s => {
      const matchesSearch = !term || 
        s.title.toLowerCase().includes(term) ||
        s.ethnicGroup?.toLowerCase().includes(term);
      
      const matchesEthnic = !selectedEthnicGroup || s.ethnicGroup === selectedEthnicGroup;
      return matchesSearch && matchesEthnic;
    });
  }, [searchTerm, selectedEthnicGroup, allStories]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const markAsRead = (id: string) => {
    if (!readStories.includes(id)) setReadStories(prev => [...prev, id]);
  };

  const handleOpenEthnicGroup = (eth: string) => {
    setSelectedEthnicGroup(eth);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus(GenerationStatus.WRITING);
    try {
      const storyData = await generateStoryText(prompt);
      const illustratedParts = await Promise.all(storyData.parts.map(async p => ({
        ...p,
        imageUrl: await generateSceneImage(p.imagePrompt || storyData.title)
      })));

      const newStory: Story = {
        id: `ai-${Date.now()}`,
        ...storyData,
        parts: illustratedParts,
        sourceType: 'AI_INSPIRED',
        createdAt: Date.now()
      };
      setAiStories(prev => [newStory, ...prev]);
      setShowInvocator(false);
      setPrompt('');
      setActiveTab('LEGENDS');
      setStatus(GenerationStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-[#aa771c] selection:text-black">
      <div className="h-1 w-full bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] fixed top-0 z-[100]" />

      {/* Menu Principal "Chefia da Aldeia" */}
      <header className="fixed top-1 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#2d1b0e] py-4 px-10 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between">
            <div 
              className="flex items-center gap-4 cursor-pointer group" 
              onClick={() => { setActiveTab('HOME'); setSelectedEthnicGroup(null); }}
            >
              <div className="w-8 h-8 bg-[#1a0f0a] rounded border border-yellow-900/40 flex items-center justify-center">
                <ScrollText className="text-yellow-600 w-4 h-4" />
              </div>
              <h1 className="text-xl font-serif gold-gradient font-bold tracking-tighter uppercase">Antes do Esquecimento</h1>
            </div>

            <nav className="flex items-center gap-10 md:gap-14">
              {[
                { id: 'HOME', label: 'Início' },
                { id: 'ETHNICITIES', label: 'Etnias' },
                { id: 'LEGENDS', label: 'Histórias' },
                { id: 'ABOUT', label: 'Sobre' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { 
                    setActiveTab(tab.id as AppTab); 
                    if (tab.id !== 'ETHNICITIES') setSelectedEthnicGroup(null);
                  }}
                  className={`text-[10px] uppercase tracking-[0.3em] font-black transition-all relative py-1 ${
                    activeTab === tab.id 
                      ? 'text-yellow-500 brightness-125' 
                      : 'text-yellow-900/40 hover:text-yellow-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-600 animate-slide-in-nav" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Fala Ancestral sob o logo */}
          <div className="ancestral-phrase">
            “Quem esquece os ancestrais caminha sem sombra.”
          </div>
        </div>
      </header>

      <main className="flex-1 mt-32">
        {/* VIEW: HOME */}
        {activeTab === 'HOME' && (
          <div className="fade-in-up px-6 py-20 max-w-5xl mx-auto text-center space-y-12">
            <div className="relative inline-block">
               <Sun className="w-16 h-16 text-yellow-600/40 mx-auto" />
               <div className="absolute -top-4 -left-4 opacity-20"><Music className="w-6 h-6 text-yellow-500" /></div>
               <div className="absolute -bottom-4 -right-4 opacity-20"><Flame className="w-6 h-6 text-yellow-500" /></div>
            </div>
            <h2 className="text-6xl md:text-9xl font-serif gold-gradient italic tracking-tighter leading-none">O Espírito da Palavra</h2>
            <p className="text-2xl md:text-4xl font-serif text-gray-400 italic leading-relaxed max-w-3xl mx-auto">
              "Enquanto a palavra viver, o povo não morre. A memória é o chão onde pisam os nossos amanhãs."
            </p>
            <div className="african-divider w-48 mx-auto opacity-40" />
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
              Este arquivo digital é um esforço de resgate. Aqui, as vozes dos antepassados encontram o eco da tecnologia para que as tradições africanas permaneçam vivas, vibrantes e respeitadas.
            </p>
            <div className="pt-10">
              <button 
                onClick={() => setActiveTab('ETHNICITIES')}
                className="px-12 py-4 border border-yellow-900/30 rounded-full text-[11px] uppercase tracking-[0.3em] font-black text-yellow-600 hover:bg-yellow-950/20 transition-all flex items-center gap-3 mx-auto"
              >
                <Compass className="w-4 h-4" /> Entrar no Círculo
              </button>
            </div>
          </div>
        )}

        {/* VIEW: ETNIAS */}
        {activeTab === 'ETHNICITIES' && (
          <div className="fade-in-up px-6 py-10 max-w-7xl mx-auto">
            {!selectedEthnicGroup ? (
              <div className="space-y-16">
                <header className="text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-serif gold-gradient italic">As Nações do Saber</h2>
                  <div className="flex justify-center gap-4 opacity-20"><Music className="w-4 h-4" /><Sun className="w-4 h-4" /><Music className="w-4 h-4" /></div>
                  <p className="text-yellow-900/40 uppercase tracking-[0.5em] text-[10px] font-black">Escolha um povo para ouvir suas memórias</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {ethnicGroupsList.sort().map(eth => (
                    <button 
                      key={eth}
                      onClick={() => handleOpenEthnicGroup(eth)}
                      className="group p-12 bg-[#0d0d0d] border-2 border-transparent hover:border-yellow-900/20 rounded-[2.5rem] transition-all text-center space-y-4 shadow-xl hover:-translate-y-2 relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-40 transition-opacity"><ScrollText className="w-6 h-6" /></div>
                      <Users className="w-6 h-6 text-yellow-900/20 group-hover:text-yellow-500 mx-auto transition-colors" />
                      <span className="block text-2xl font-serif text-yellow-700 group-hover:text-yellow-400 transition-colors">{eth}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-16 animate-fade-in">
                <button 
                  onClick={() => setSelectedEthnicGroup(null)}
                  className="flex items-center gap-3 text-yellow-900/50 hover:text-yellow-500 transition-colors uppercase text-[10px] font-black tracking-[0.2em] group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Ver todas as Nações
                </button>
                
                <header className="text-center space-y-4">
                  <div className="flex justify-center gap-2 opacity-10 mb-2"><Mic2 className="w-4 h-4" /><Flame className="w-4 h-4" /><Mic2 className="w-4 h-4" /></div>
                  <h2 className="text-7xl md:text-9xl font-serif gold-gradient italic tracking-tighter leading-none">{selectedEthnicGroup}</h2>
                  <div className="african-divider w-32 mx-auto opacity-30" />
                </header>

                <div className="grid gap-20 max-w-4xl mx-auto">
                  {filteredStories.map(story => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      isFavorite={favorites.includes(story.id)}
                      onToggleFavorite={() => toggleFavorite(story.id)}
                      onRead={() => markAsRead(story.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: HISTÓRIAS */}
        {activeTab === 'LEGENDS' && (
          <div className="fade-in-up px-6 py-10 max-w-5xl mx-auto space-y-20">
            <header className="text-center space-y-6">
              <ScrollText className="w-12 h-12 text-yellow-600/20 mx-auto" />
              <h2 className="text-5xl md:text-7xl font-serif gold-gradient italic tracking-tighter">Pergaminho de Lendas</h2>
              <p className="text-gray-500 font-serif italic text-xl max-w-2xl mx-auto">Onde o tempo não apaga o que a voz eterniza. Narrativas do arquivo e sussurros do Griot Digital.</p>
              
              <div className="pt-8">
                <button 
                  onClick={() => setShowInvocator(!showInvocator)}
                  className={`flex items-center gap-3 mx-auto px-10 py-3 rounded-full border transition-all ${
                    showInvocator ? 'bg-yellow-600 text-black border-yellow-500' : 'border-yellow-900/30 text-yellow-600 hover:bg-yellow-950/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Invocação do Griot Digital</span>
                </button>
              </div>
            </header>

            {showInvocator && (
              <div className="bg-[#0d0d0d] border border-yellow-900/10 rounded-[2.5rem] p-12 shadow-2xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-900/40 to-transparent" />
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Sobre qual segredo ancestral o Griot deve falar? Ex: A sabedoria dos rios de Angola..."
                  className="w-full bg-transparent border-none focus:ring-0 text-2xl text-yellow-100 placeholder:text-yellow-900/20 h-40 resize-none font-serif outline-none mb-6"
                />
                <Button 
                  onClick={handleGenerate} 
                  className="w-full !rounded-2xl py-6 text-lg"
                  isLoading={status === GenerationStatus.WRITING}
                >
                  <Sparkles className="w-5 h-5" /> Invocar Memória
                </Button>
              </div>
            )}

            <div className="grid gap-24">
              {filteredStories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  isFavorite={favorites.includes(story.id)}
                  onToggleFavorite={() => toggleFavorite(story.id)}
                  onRead={() => markAsRead(story.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SOBRE (ABOUT) */}
        {activeTab === 'ABOUT' && (
          <div className="fade-in-up min-h-[90vh] bg-[#1a0f0a] flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden border-y border-yellow-900/10 shadow-inner">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none african-pattern scale-150 rotate-12" />
            
            <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10">
              <div className="flex justify-center gap-12 mb-4">
                <Music className="w-10 h-10 text-yellow-600/30 animate-pulse" />
                <Landmark className="w-12 h-12 text-yellow-600/50" />
                <Flame className="w-10 h-10 text-yellow-600/30 animate-pulse" />
              </div>
              
              <h2 className="text-6xl md:text-8xl font-serif gold-gradient italic leading-none tracking-tighter">O Propósito das Vozes</h2>
              
              <div className="space-y-12 text-gray-300 font-serif text-xl md:text-3xl italic leading-relaxed text-justify md:text-center">
                <p className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                  "Aproxime-se, meu filho. Sente-se à volta desta fogueira digital. O que vês aqui não é apenas código ou imagens, mas o sopro de mil gerações que se recusaram a ser esquecidas."
                </p>
                
                <p className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                  Este site é um <strong>arquivo vivo</strong>. Ele existe porque uma história que não é contada é uma raiz que seca. Aqui, guardamos o que é real: as tradições orais Bakongo, a coragem dos guerreiros Ovimbundu e a sabedoria secular dos Chokwe.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <div className="p-10 bg-black/40 rounded-[3rem] border-l-8 border-yellow-600/20 space-y-6 group hover:border-yellow-600/60 transition-all text-left">
                    <BookOpen className="w-8 h-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                    <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-yellow-700">A Memória Sagrada</h4>
                    <p className="text-base not-italic text-gray-400 font-sans">Compilamos o saber real das etnias africanas, honrando cada nome e cada região com a verdade dos fatos.</p>
                  </div>
                  <div className="p-10 bg-black/40 rounded-[3rem] border-l-8 border-yellow-600/20 space-y-6 group hover:border-yellow-600/60 transition-all text-left">
                    <Mic2 className="w-8 h-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                    <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-yellow-700">O Novo Eco</h4>
                    <p className="text-base not-italic text-gray-400 font-sans">Invocamos a tecnologia como um novo Griot, capaz de imaginar narrativas inspiradas que mantêm o respeito pela nossa cultura ancestral.</p>
                  </div>
                </div>

                <p className="fade-in-up" style={{ animationDelay: '0.8s' }}>
                  Nosso objetivo é único: <strong>mostrar África com dignidade</strong>. Queremos que as novas gerações saibam que vêm de reis, sábios e artistas. Que a memória seja o escudo contra o esquecimento.
                </p>
              </div>

              <div className="african-divider w-32 mx-auto opacity-30 fade-in-up" style={{ animationDelay: '1s' }} />

              <div className="space-y-6 pt-10 fade-in-up" style={{ animationDelay: '1.2s' }}>
                <p className="text-[12px] uppercase tracking-[0.6em] font-black text-yellow-800">Este site não é brincadeira. É memória. É raiz. É África.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-24 px-6 border-t border-[#2d1b0e] bg-black text-center space-y-10">
        <div className="flex justify-center gap-12 opacity-10">
           <Sun className="w-8 h-8 text-yellow-600" />
           <Flame className="w-8 h-8 text-yellow-600" />
           <Sun className="w-8 h-8 text-yellow-600" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl font-serif gold-gradient font-bold uppercase tracking-tighter">Antes do Esquecimento</h3>
          <p className="text-[10px] text-yellow-900/40 font-black uppercase tracking-[0.5em]">© {new Date().getFullYear()} PROJETO GRIOT DIGITAL &bull; ARQUIVO CULTURAL AFRICANO</p>
        </div>

        <div className="pt-10 border-t border-yellow-900/5 max-w-2xl mx-auto space-y-6">
          <p className="text-xs font-serif italic text-yellow-700/60 leading-relaxed">
            "Enquanto a raiz estiver viva, a árvore voltará a dar frutos. Honramos os que vieram antes para que os que vêm depois saibam onde pisar."
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-900/20">
            Fala cultural e ancestral &bull; Memória Viva
          </p>
        </div>
      </footer>
    </div>
  );
};

const StoryCard: React.FC<{ 
  story: Story; 
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRead: () => void;
}> = ({ story, isFavorite, onToggleFavorite, onRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e){}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleAudioPlayback = async () => {
    if (isPlaying) { stopAudio(); return; }
    setIsAudioLoading(true);
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      let base64 = story.audioBase64;
      if (!base64) {
        base64 = await generateNarration(story.parts.map(p => p.text).join(" "));
        story.audioBase64 = base64;
      }
      if (base64) {
        const buffer = await decodeAudio(base64);
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
        audioSourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (e) { console.error(e); } finally { setIsAudioLoading(false); }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) onRead();
  };

  const bannerImage = story.parts.find(p => p.imageUrl)?.imageUrl;

  return (
    <article 
      ref={containerRef}
      className={`relative group bg-[#0a0a0a] border ${story.sourceType === 'REAL_ARCHIVE' ? 'border-yellow-900/10' : 'border-[#4a2c16]/30'} rounded-[3rem] transition-all duration-700 shadow-2xl overflow-hidden tribal-border`}
    >
      {/* Decorative Icons on Borders */}
      <div className="absolute top-8 left-0 w-1 h-12 bg-yellow-600/30 rounded-r-full" />
      <div className="absolute top-20 left-0 w-1 h-8 bg-yellow-600/20 rounded-r-full" />

      {bannerImage && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img 
            src={bannerImage} 
            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 brightness-[0.5] group-hover:brightness-[0.9]"
            alt={story.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
          <div className="absolute bottom-6 left-10 flex gap-4 z-10">
            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
              story.sourceType === 'REAL_ARCHIVE' ? 'bg-yellow-600 text-black border-yellow-400' : 'bg-black/50 text-yellow-500 border-yellow-900/50 backdrop-blur-md'
            }`}>
              {story.sourceType === 'REAL_ARCHIVE' ? 'Tomo Real' : 'IA Griot'}
            </span>
          </div>
        </div>
      )}

      <div className="p-10 md:p-14 space-y-8">
        <div className="flex justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Music className="w-4 h-4 text-yellow-600/40" />
               <h3 className="text-3xl md:text-5xl font-serif text-yellow-600 leading-tight group-hover:gold-gradient transition-all cursor-pointer tracking-tighter" onClick={toggleExpand}>
                 {story.title}
               </h3>
            </div>
            <div className="flex gap-4 text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-7">
              <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-yellow-900/50" /> {story.region}</span>
              <span className="flex items-center gap-2"><Users className="w-3 h-3 text-yellow-900/50" /> {story.ethnicGroup}</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-4 rounded-2xl transition-all ${isFavorite ? 'bg-yellow-600 text-black shadow-xl scale-110' : 'bg-black text-yellow-900/20 border border-yellow-900/10 hover:text-yellow-600'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className={`text-xl md:text-2xl font-serif text-gray-400 italic leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          "{story.parts[0].text}"
        </p>

        {isExpanded && (
          <div className="space-y-12 animate-fade-in pt-8 border-t border-[#2d1b0e]">
            {story.parts.slice(1).map((part, i) => (
              <div key={i} className="space-y-10">
                <p className="text-lg md:text-2xl font-serif text-gray-300 italic leading-relaxed text-justify">{part.text}</p>
                {part.imageUrl && (
                  <div className="relative">
                    <img 
                      src={part.imageUrl} 
                      className="w-full h-auto rounded-3xl border border-[#2d1b0e] grayscale-[0.3] hover:grayscale-0 transition-all duration-1000" 
                      alt="Cena" 
                    />
                    <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 opacity-50"><Sun className="w-4 h-4" /></div>
                  </div>
                )}
              </div>
            ))}
            {story.sourceReference && (
              <div className="p-8 bg-[#111] rounded-2xl border border-yellow-900/5 flex items-center gap-6">
                <Landmark className="w-8 h-8 text-yellow-900/20" />
                <div>
                   <span className="text-[9px] uppercase tracking-widest font-black text-yellow-900/40 block mb-1">Fonte do Arquivo</span>
                   <p className="text-sm font-serif italic text-gray-500">{story.sourceReference}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#2d1b0e] gap-6">
           <button onClick={toggleExpand} className="text-[10px] uppercase font-black tracking-[0.3em] text-yellow-700 hover:text-yellow-400 flex items-center gap-2 group/btn">
             {isExpanded ? <><ChevronUp className="w-4 h-4" /> Recolher Pergaminho</> : <><ChevronDown className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" /> Desenrolar História</>}
           </button>
           <div className="flex items-center gap-8">
             <button 
               onClick={handleAudioPlayback}
               disabled={isAudioLoading}
               className="flex items-center gap-2.5 text-[10px] font-black uppercase text-yellow-900/40 hover:text-yellow-600 transition-all tracking-widest disabled:opacity-30"
             >
               {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
               {isPlaying ? "Silenciar Griot" : "Griot Áudio"}
             </button>
             <button className="flex items-center gap-2.5 text-[10px] font-black uppercase text-yellow-900/40 hover:text-yellow-600 transition-all tracking-widest">
               <Share2 className="w-4 h-4" /> Partilhar
             </button>
           </div>
        </div>
      </div>
    </article>
  );
};

export default App;
