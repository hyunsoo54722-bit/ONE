/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles, Layout, Grid } from 'lucide-react';
import { FrameLayout, FrameTheme } from '../types';
import { PRESET_THEMES } from '../data/themes';

interface WelcomeScreenProps {
  onStart: (className: string, layout: FrameLayout, theme: FrameTheme) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [className, setClassName] = useState('기린반');
  const [selectedLayout, setSelectedLayout] = useState<FrameLayout>('vertical');
  const [selectedTheme, setSelectedTheme] = useState<FrameTheme>(PRESET_THEMES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = className.trim() || '우리반';
    onStart(finalName, selectedLayout, selectedTheme);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 text-[#5D4037]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-xl p-8 bg-white border-8 border-white rounded-[40px] shadow-2xl relative overflow-hidden"
      >
        {/* Banner/Header */}
        <div className="relative text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-12 -left-6 text-5xl select-none"
          >
            🌱
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-12 -right-6 text-5xl select-none"
          >
            🌼
          </motion.div>

          <span className="inline-block px-5 py-1.5 mb-2.5 text-xs font-bold text-[#8D6E63] bg-[#F1F8E9] rounded-full border-2 border-[#A5D6A7]">
            🐣 신나는 우리들의 네컷 놀이
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#5D4037] font-sans drop-shadow-xs">
            우리반 <span className="text-[#A5D6A7]">네컷 사진관</span>
          </h1>
          <p className="mt-2 text-sm text-[#8D6E63] font-semibold">
            친구들과 함께 예쁜 추억을 찰칵! 찍어봐요 📸
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Class Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#5D4037] flex items-center gap-1.5">
              <span>✏️</span> 우리 반 이름을 적어주세요!
            </label>
            <div className="relative">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value.slice(0, 15))}
                placeholder="예) 햇살반, 기린반, 꽃님반..."
                className="w-full px-6 py-3.5 text-lg font-bold text-center border-3 border-[#FFE082] bg-[#FEF9E7]/40 focus:bg-white focus:outline-none focus:border-[#81C784] rounded-2.5xl transition duration-200 text-[#5D4037]"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-[#8D6E63]/50 font-mono font-bold">
                {className.length}/15자
              </span>
            </div>
          </div>

          {/* 3. Theme Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#5D4037] flex items-center gap-1.5">
              <span>🎨</span> 마음에 드는 배경색을 선택해요!
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  style={{ backgroundColor: theme.bgColor }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2.5xl border-3 transition-all duration-200 ${
                    selectedTheme.id === theme.id
                      ? 'border-[#81C784] scale-[1.04] shadow-md font-bold'
                      : 'border-white hover:scale-[1.02] shadow-sm'
                  }`}
                >
                  <span className="text-2xl mb-1 select-none">{theme.emoji}</span>
                  <span
                    style={{ color: theme.textColor }}
                    className="text-xs font-extrabold truncate max-w-full"
                  >
                    {theme.name.split(' ')[0]}
                  </span>
                  {selectedTheme.id === theme.id && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#81C784] text-white rounded-full p-0.5 text-[10px] w-5 h-5 flex items-center justify-center border-2 border-white font-bold animate-bounce">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-[#81C784] hover:bg-[#66BB6A] text-white font-extrabold text-xl rounded-full shadow-lg border-b-4 border-[#388E3C] flex items-center justify-center gap-2 transition duration-200"
            >
              <Camera className="w-6 h-6 animate-pulse" />
              <span>사진 찍으러 출발! 📸</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Small Tip Footer */}
      <p className="mt-4 text-xs text-[#8D6E63] font-bold flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-[#FFD54F]" />
        컴퓨터나 패드의 카메라가 켜져 있는지 확인해 주세요!
      </p>
    </div>
  );
}
