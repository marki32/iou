import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ImageInput from './components/ImageInput';
import CameraCapture from './components/CameraCapture';
import { analyzeImage, searchWeb } from './services/geminiService';
import { AppState, SearchResult } from './types';
import {
  BackIcon, LoadingIcon, SparklesIcon, GlobeIcon, ZapIcon, ShareIcon,
  ChevronRightIcon, ScanLineIcon, BrainIcon, GithubIcon, TwitterIcon,
  HeartIcon, ClockIcon, CopyIcon, CheckIcon, CameraIcon
} from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [image, setImage] = useState<string | null>(null); // Base64 string
  const [analysisText, setAnalysisText] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Mobile Tab State for Results View
  const [activeTab, setActiveTab] = useState<'analysis' | 'search'>('analysis');

  // Handle Image Selection
  const handleImageProcess = useCallback(async (base64: string) => {
    setImage(base64);
    setState(AppState.ANALYZING);
    setError('');
    setAnalysisText('');
    setSearchResult(null);
    setActiveTab('analysis'); // Reset tab

    try {
      // 1. Analyze Image
      const result = await analyzeImage(base64);
      setAnalysisText(result.text);
      setState(AppState.RESULTS);

      // 2. Auto-trigger Web Search if query exists
      if (result.searchQuery) {
        setIsSearching(true);
        try {
          const webResult = await searchWeb(result.searchQuery);
          setSearchResult(webResult);
        } catch (searchErr) {
          console.error("Web search failed", searchErr);
        } finally {
          setIsSearching(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Sorry, I couldn't analyze that image. Please try again.";

      const errString = err.toString() + JSON.stringify(err);
      if (errString.includes("API key") || errString.includes("API_KEY_INVALID")) {
        errorMessage = "Invalid Gemini API Key. Please check your .env.local file.";
      }

      setError(errorMessage);
      setState(AppState.IDLE);
      setImage(null);
    }
  }, []);

  const resetApp = () => {
    setState(AppState.IDLE);
    setImage(null);
    setAnalysisText('');
    setSearchResult(null);
    setError('');
    setIsSearching(false);
    setActiveTab('analysis');
  };

  const handleCopy = async () => {
    const textToCopy = activeTab === 'analysis' ? analysisText : searchResult?.text || '';
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const textToShare = `Identify.ai Analysis:\n\n${analysisText}\n\nLive Intelligence:\n${searchResult?.text || 'N/A'}`;

    const shareData = {
      title: 'Identify.ai Result',
      text: textToShare,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
        alert('Results copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Swipe Handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab === 'analysis') {
      setActiveTab('search');
    }
    if (isRightSwipe && activeTab === 'search') {
      setActiveTab('analysis');
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFEFA] text-[#1C1917] font-sans relative overflow-hidden flex flex-col">

      {/* Header - Sticky Top with Glassmorphism */}
      <header className="sticky top-0 z-50 px-4 py-3 flex justify-between items-center bg-[#FEFEFA]/80 backdrop-blur-md border-b border-stone-100/50">
        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-sm" onClick={resetApp}>
          <SparklesIcon className="w-6 h-6 text-[#1C1917]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight font-['Inter']">Identify</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors" onClick={() => alert('History feature coming soon!')}>
          <ClockIcon className="w-6 h-6 text-[#78716C]" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-[calc(100vh-64px)]">

        {/* LANDING PAGE STATE */}
        {state === AppState.LANDING && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-20">
            <div className="mb-8 animate-[fadeInUp_1s_ease-out]">
              <div className="w-24 h-24 bg-yellow-400 rounded-3xl rotate-6 shadow-xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform duration-300">
                <SparklesIcon className="w-12 h-12 text-[#1C1917]" />
              </div>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tighter text-[#1C1917] mb-6 leading-[1.1] animate-[fadeInUp_1s_ease-out_0.2s_both]">
              Identify<span className="text-yellow-500">.</span>
            </h1>

            <p className="text-lg text-[#78716C] mb-12 leading-relaxed max-w-xs mx-auto animate-[fadeInUp_1s_ease-out_0.4s_both]">
              Visual intelligence for your world. Snap, identify, and explore.
            </p>

            <button
              onClick={() => setState(AppState.IDLE)}
              className="group relative px-8 py-4 bg-[#1C1917] text-white text-lg font-semibold rounded-full shadow-xl shadow-stone-300 hover:scale-105 transition-all duration-300 flex items-center gap-3 animate-[fadeInUp_1s_ease-out_0.6s_both]"
            >
              <span>Start Identifying</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* IDLE STATE (HOME SCANNER) */}
        {state === AppState.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-[#1C1917] text-center">
              What are you <br /> looking at?
            </h2>
            <p className="text-[#78716C] mb-8 text-center max-w-xs">
              Identify plants, products, landmarks, and more instantly.
            </p>

            <ImageInput
              onImageSelected={handleImageProcess}
              onCameraRequest={() => setShowCamera(true)}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 text-sm animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* ANALYZING STATE */}
        {state === AppState.ANALYZING && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in pb-20">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-[#FEF08A] flex items-center justify-center animate-pulse border border-yellow-200">
                <SparklesIcon className="w-10 h-10 text-yellow-600 animate-spin-slow" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg border border-stone-100">
                <LoadingIcon className="w-6 h-6 text-[#1C1917]" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold tracking-tight text-[#1C1917]">Analyzing...</h3>
            <p className="text-[#78716C] mt-2">Identifying objects and details</p>
          </div>
        )}

        {/* RESULTS STATE - NEW MOBILE LAYOUT */}
        {state === AppState.RESULTS && image && (
          <div className="flex flex-col h-full relative">

            {/* 1. Image Display Area (Top 30%) */}
            <div className="h-[30vh] px-4 pt-2 pb-4 flex-shrink-0 z-10">
              <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100">
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Analyzed"
                  className="w-full h-full object-cover"
                />
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Analyzed</span>
                </div>
              </div>
            </div>

            {/* 2. Control Section (Segmented Control) */}
            <div className="px-6 py-2 flex-shrink-0 z-20 bg-[#FEFEFA]">
              <div className="bg-stone-100 p-1 rounded-full flex relative">
                {/* Sliding Background Pill */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1C1917] rounded-full transition-all duration-300 ease-out shadow-md ${activeTab === 'analysis' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                />

                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium relative z-10 transition-colors duration-300 ${activeTab === 'analysis' ? 'text-white' : 'text-[#78716C]'}`}
                >
                  Visual Analysis
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium relative z-10 transition-colors duration-300 ${activeTab === 'search' ? 'text-white' : 'text-[#78716C]'}`}
                >
                  Live Intelligence
                </button>
              </div>
            </div>

            {/* 3. Content Area (Bottom Scrollable Card) */}
            <div
              className="flex-1 bg-white rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-stone-50 overflow-hidden flex flex-col mt-2"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >

              {/* Content Header */}
              <div className="px-6 py-5 flex justify-between items-center border-b border-stone-50 bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-[#1C1917]">Results</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="w-10 h-10 rounded-full bg-[#FEF08A]/50 flex items-center justify-center text-[#1C1917] hover:bg-[#FEF08A] transition-colors"
                  >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-[#FEF08A]/50 flex items-center justify-center text-[#1C1917] hover:bg-[#FEF08A] transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 pb-24 no-scrollbar">
                {activeTab === 'analysis' ? (
                  <div className="prose prose-stone prose-lg max-w-none prose-p:text-[#78716C] prose-headings:text-[#1C1917] prose-li:text-[#78716C] prose-strong:text-[#1C1917]">
                    <ReactMarkdown>{analysisText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="prose prose-stone prose-lg max-w-none prose-p:text-[#78716C] prose-headings:text-[#1C1917] prose-a:text-yellow-600">
                    {isSearching ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-stone-100 rounded w-3/4" />
                        <div className="h-4 bg-stone-100 rounded w-full" />
                        <div className="h-4 bg-stone-100 rounded w-5/6" />
                      </div>
                    ) : (
                      <ReactMarkdown>{searchResult?.text || 'No live data found.'}</ReactMarkdown>
                    )}
                  </div>
                )}
              </div>

              {/* Floating Action Button (Overlay) */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                <button
                  onClick={resetApp}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white rounded-full shadow-xl shadow-stone-400/30 hover:scale-105 transition-transform active:scale-95"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span className="font-medium">New Scan</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleImageProcess}
          onClose={() => setShowCamera(false)}
        />
      )}

    </div>
  );
};

export default App;