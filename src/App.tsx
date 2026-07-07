/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Sparkles } from 'lucide-react';
import { AppPhase, FrameLayout, FrameTheme, Photo, PlacedSticker } from './types';
import { PRESET_THEMES } from './data/themes';

import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import PhotoSelectScreen from './components/PhotoSelectScreen';
import EditorScreen from './components/EditorScreen';
import ExportScreen from './components/ExportScreen';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('welcome');
  const [className, setClassName] = useState('기린반');
  const [layout, setLayout] = useState<FrameLayout>('vertical');
  const [theme, setTheme] = useState<FrameTheme>(PRESET_THEMES[0]);
  
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  
  const [footerText, setFooterText] = useState('');
  const [footerDate, setFooterDate] = useState('');
  const [footerSlogan, setFooterSlogan] = useState('');

  // Step indicator info
  const steps = [
    { id: 'welcome', label: '🐣 준비하기', number: 1 },
    { id: 'shooting', label: '📸 촬영하기', number: 2 },
    { id: 'selection', label: '✨ 사진 고르기', number: 3 },
    { id: 'editing', label: '🎨 프레임 꾸미기', number: 4 },
    { id: 'export', label: '🖼️ 사진 저장', number: 5 },
  ];

  // Phase transition callbacks
  const handleStartShooting = (enteredClassName: string, chosenLayout: FrameLayout, chosenTheme: FrameTheme) => {
    setClassName(enteredClassName);
    setLayout(chosenLayout);
    setTheme(chosenTheme);
    setPhase('shooting');
  };

  const handleCaptureComplete = (capturedPhotos: Photo[]) => {
    setAllPhotos(capturedPhotos);
    setPhase('selection');
  };

  const handleSelectComplete = (orderedPhotos: Photo[]) => {
    setSelectedPhotos(orderedPhotos);
    setPhase('editing');
  };

  const handleEditComplete = (
    finalLayout: FrameLayout,
    finalTheme: FrameTheme,
    finalStickers: PlacedSticker[],
    finalFooterText: string,
    finalFooterDate: string,
    finalFooterSlogan: string
  ) => {
    setLayout(finalLayout);
    setTheme(finalTheme);
    setStickers(finalStickers);
    setFooterText(finalFooterText);
    setFooterDate(finalFooterDate);
    setFooterSlogan(finalFooterSlogan);
    setPhase('export');
  };

  const handleRestart = () => {
    setAllPhotos([]);
    setSelectedPhotos([]);
    setStickers([]);
    setPhase('welcome');
  };

  const handleBackToSelect = () => {
    setPhase('selection');
  };

  const getActiveStepNumber = () => {
    const found = steps.find((step) => step.id === phase);
    return found ? found.number : 1;
  };

  return (
    <div className="min-h-screen bg-[#FEF9E7] text-[#5D4037] font-sans selection:bg-[#FFE082]/50">
      
      {/* Dynamic Animated Sparkly Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-10 left-10 text-4xl animate-bounce duration-[6s] opacity-25">🌱</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce duration-[8s] opacity-20">☁️</div>
        <div className="absolute bottom-20 left-1/4 text-4xl animate-pulse duration-[5s] opacity-20">🌸</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce duration-[7s] opacity-25">🍀</div>
      </div>

      {/* Natural Tones Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 pb-4 flex flex-col items-center sm:flex-row sm:justify-between gap-4 border-b-2 border-white/40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleRestart}>
          <div className="w-10 h-10 bg-[#FFD54F] rounded-full flex items-center justify-center text-white shadow-md animate-spin-slow">
            <Camera className="w-5 h-5 text-[#5D4037]" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-[#5D4037] flex items-center gap-1.5 leading-none">
              <span>우리반 네컷</span>
              <span className="text-[#A5D6A7] font-extrabold text-lg">Kindergarten</span>
            </span>
            <span className="text-[10px] text-[#8D6E63] font-bold tracking-wide">NATURAL TONES PHOTO BOOTH</span>
          </div>
        </div>

        {/* Natural Tones Progress Stepper */}
        <div className="flex items-center gap-1 bg-white/70 border-2 border-white rounded-full py-1.5 px-3.5 shadow-sm overflow-x-auto max-w-full">
          {steps.map((step) => {
            const isActive = step.id === phase;
            const isCompleted = getActiveStepNumber() > step.number;
            
            return (
              <React.Fragment key={step.id}>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#FFD54F] text-[#5D4037] font-extrabold shadow-sm scale-105' 
                    : isCompleted 
                    ? 'bg-[#81C784] text-white font-bold shadow-xs' 
                    : 'text-[#8D6E63]/60'
                }`}>
                  <span className={`text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ${
                    isActive 
                      ? 'bg-white text-[#5D4037]' 
                      : isCompleted 
                      ? 'bg-white/30 text-white' 
                      : 'bg-[#5D4037]/5 text-[#5D4037]/40'
                  }`}>
                    {step.number}
                  </span>
                  <span className="text-[11px] md:text-xs tracking-tight">{step.label}</span>
                </div>
                {step.number < 5 && (
                  <span className="text-[#8D6E63]/30 font-bold shrink-0">·</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {/* Main Screen Content Router */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {phase === 'welcome' && (
              <WelcomeScreen onStart={handleStartShooting} />
            )}

            {phase === 'shooting' && (
              <CameraScreen 
                onCaptureComplete={handleCaptureComplete} 
                className={className}
              />
            )}

            {phase === 'selection' && (
              <PhotoSelectScreen 
                photos={allPhotos} 
                onSelectComplete={handleSelectComplete} 
                onRestart={handleRestart}
              />
            )}

            {phase === 'editing' && (
              <EditorScreen 
                selectedPhotos={selectedPhotos}
                initialLayout={layout}
                initialTheme={theme}
                className={className}
                onComplete={handleEditComplete}
                onBack={handleBackToSelect}
              />
            )}

            {phase === 'export' && (
              <ExportScreen 
                layout={layout}
                theme={theme}
                selectedPhotos={selectedPhotos}
                stickers={stickers}
                footerText={footerText}
                footerDate={footerDate}
                footerSlogan={footerSlogan}
                onRestart={handleRestart}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Natural Tones Footer */}
      <footer className="relative z-10 text-center py-6 text-[#8D6E63] text-[11px] font-medium border-t-2 border-white/40 mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#81C784] rounded-full"></span> 
          <span>카메라 연결됨</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FFD54F] rounded-full"></span> 
          <span>친환경 종이 인화 모드</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD54F] animate-spin" />
          <span>우리반 네컷 사진관 - 따뜻한 자연의 색감으로 꾸며요 🌿</span>
        </div>
      </footer>
    </div>
  );
}
