/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Palette, 
  Type, 
  Smile, 
  Trash2, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  Grid, 
  LayoutList 
} from 'lucide-react';
import { Photo, FrameLayout, FrameTheme, PlacedSticker } from '../types';
import { PRESET_THEMES, STICKER_CATEGORIES } from '../data/themes';

interface EditorScreenProps {
  selectedPhotos: Photo[];
  initialLayout: FrameLayout;
  initialTheme: FrameTheme;
  className: string;
  onComplete: (
    layout: FrameLayout,
    theme: FrameTheme,
    stickers: PlacedSticker[],
    footerText: string,
    footerDate: string,
    footerSlogan: string
  ) => void;
  onBack: () => void;
}

export default function EditorScreen({
  selectedPhotos,
  initialLayout,
  initialTheme,
  className: initialClassName,
  onComplete,
  onBack,
}: EditorScreenProps) {
  const [layout, setLayout] = useState<FrameLayout>(initialLayout);
  const [theme, setTheme] = useState<FrameTheme>(initialTheme);
  const [footerText, setFooterText] = useState(`${initialClassName}`);
  const [footerDate, setFooterDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  });
  const [footerSlogan, setFooterSlogan] = useState('우리들의 행복한 날들 🧡');
  
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'theme' | 'text' | 'sticker'>('theme');
  const [stickerCategory, setStickerCategory] = useState(0);

  const frameRef = useRef<HTMLDivElement | null>(null);

  // Background Pattern Styles helper
  const getPatternStyle = (t: FrameTheme) => {
    const pColor = t.patternColor;
    if (t.pattern === 'dots') {
      return {
        backgroundImage: `radial-gradient(circle, ${pColor} 18%, transparent 18%)`,
        backgroundSize: '16px 16px',
      };
    }
    if (t.pattern === 'stripes') {
      return {
        backgroundImage: `linear-gradient(45deg, ${pColor} 25%, transparent 25%, transparent 50%, ${pColor} 50%, ${pColor} 75%, transparent 75%, transparent)`,
        backgroundSize: '24px 24px',
      };
    }
    if (t.pattern === 'stars') {
      return {
        backgroundImage: `radial-gradient(circle, ${pColor} 12%, transparent 12%), radial-gradient(circle, ${pColor} 8%, transparent 8%)`,
        backgroundSize: '32px 32px',
        backgroundPosition: '0 0, 16px 16px',
      };
    }
    return {}; // solid
  };

  // Sticker operations
  const addSticker = (emoji: string) => {
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      emoji,
      x: 50, // center
      y: 40, // upper middle
      scale: 1.0,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const updateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Pointer move sticker handler
  const handleStickerPointerDown = (e: React.PointerEvent, stickerId: string) => {
    e.preventDefault();
    setSelectedStickerId(stickerId);

    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;

    const moveHandler = (moveEvent: PointerEvent) => {
      // Calculate normalized percentage (0-100) inside the frame container
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      // Restrict sticker movement exactly inside the bounds (0-100) with small buffer
      const clampedX = Math.max(2, Math.min(98, x));
      const clampedY = Math.max(2, Math.min(98, y));

      updateSticker(stickerId, { x: clampedX, y: clampedY });
    };

    const upHandler = () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-[#5D4037]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Frame Interactive Workspace (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="mb-4 text-center">
            <span className="text-xs bg-[#FEF9E7] border border-[#FFE082] text-[#5D4037] font-extrabold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1 shadow-sm">
              ✨ 스티커를 꾹 눌러 이리저리 옮겨보세요!
            </span>
          </div>

          {/* Interactive Frame Container */}
          <div 
            ref={frameRef}
            onClick={() => setSelectedStickerId(null)} // click empty area to deselect
            style={{ 
              backgroundColor: theme.bgColor,
              borderColor: theme.borderColor,
              ...getPatternStyle(theme)
            }}
            className={`relative border-8 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 select-none ${
              layout === 'vertical' 
                ? 'w-[280px] sm:w-[320px] aspect-[1/2.8] py-8 px-4 flex flex-col justify-between' 
                : 'w-[320px] sm:w-[380px] aspect-[4/5] p-5 flex flex-col justify-between'
            }`}
          >
            {/* Template Decorations */}
            {theme.decorations.map((dec, idx) => {
              const positionClasses = {
                'top-left': 'absolute top-2 left-2',
                'top-right': 'absolute top-2 right-2',
                'bottom-left': 'absolute bottom-16 left-2',
                'bottom-right': 'absolute bottom-16 right-2',
                'footer-left': 'absolute bottom-4 left-3',
                'footer-right': 'absolute bottom-4 right-3',
              };
              // Filter decorations depending on layout
              if (layout === 'grid2x2' && (dec.position === 'bottom-left' || dec.position === 'bottom-right')) {
                // Shift bottom decorations slightly higher to avoid overlapping texts
                return (
                  <span 
                    key={idx} 
                    className={`absolute bottom-20 ${dec.position.includes('left') ? 'left-3' : 'right-3'} ${dec.size} select-none animate-pulse`}
                  >
                    {dec.emoji}
                  </span>
                );
              }
              return (
                <span 
                  key={idx} 
                  className={`${positionClasses[dec.position] || 'absolute'} ${dec.size} select-none animate-pulse`}
                >
                  {dec.emoji}
                </span>
              );
            })}

            {/* Layout Contents */}
            {layout === 'vertical' ? (
              /* CLASSIC VERTICAL 4-CUT */
              <div className="flex-1 flex flex-col justify-between gap-2 z-10">
                {selectedPhotos.map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-[4/3] bg-gray-100 rounded border-2 border-white shadow-sm overflow-hidden">
                    <img 
                      src={photo.dataUrl} 
                      alt={`4컷-${idx}`} 
                      className="w-full h-full object-cover" 
                      draggable={false}
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black bg-opacity-40 text-[9px] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* 2X2 SQUARE GRID */
              <div className="flex-1 grid grid-cols-2 gap-2 z-10 mb-2">
                {selectedPhotos.map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-[3/4] bg-gray-100 rounded-lg border-2 border-white shadow-sm overflow-hidden">
                    <img 
                      src={photo.dataUrl} 
                      alt={`2x2-${idx}`} 
                      className="w-full h-full object-cover" 
                      draggable={false}
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black bg-opacity-40 text-[9px] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Frame Footer Info */}
            <div className="mt-4 pt-1 text-center border-t border-dashed border-black border-opacity-10 z-10 select-none">
              <h3 
                style={{ color: theme.textColor }} 
                className="text-base font-extrabold tracking-wide"
              >
                {footerText || '우리반 네컷'}
              </h3>
              <p 
                style={{ color: theme.textColor }} 
                className="text-[9px] opacity-80 mt-0.5 font-bold tracking-wider"
              >
                {footerSlogan}
              </p>
              <div 
                style={{ color: theme.textColor }} 
                className="text-[8px] font-mono opacity-60 mt-1 font-bold"
              >
                {footerDate}
              </div>
            </div>

            {/* Floating Placed Stickers Layer */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {stickers.map((s) => {
                const isSelected = selectedStickerId === s.id;
                return (
                  <div
                    key={s.id}
                    style={{
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`,
                      cursor: 'grab',
                    }}
                    onPointerDown={(e) => handleStickerPointerDown(e, s.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStickerId(s.id);
                    }}
                    className={`absolute pointer-events-auto select-none p-1.5 rounded-lg transition-shadow duration-150 ${
                      isSelected ? 'border-2 border-dashed border-[#81C784] bg-[#F1F8E9] bg-opacity-40 shadow-md ring-2 ring-[#A5D6A7]' : 'hover:bg-[#FEF9E7]/20'
                    }`}
                  >
                    {/* Sticker Content */}
                    <span className="text-3xl md:text-4xl block leading-none filter drop-shadow">
                      {s.emoji}
                    </span>

                    {/* Quick controls bubble only when selected */}
                    {isSelected && (
                      <div 
                        onPointerDown={(e) => e.stopPropagation()} // stop dragging from delete trigger
                        className="absolute -top-7 -right-7 flex items-center bg-white border-2 border-[#A5D6A7] rounded-full px-1.5 py-0.5 shadow-lg gap-1 pointer-events-auto"
                      >
                        <button
                          onClick={() => removeSticker(s.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Customization Panel Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white border-4 border-white rounded-[32px] p-6 shadow-xl space-y-6">
          <div className="border-b-2 border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-[#5D4037]">우리반 네컷 꾸미기방 🎨</h2>
            <p className="text-sm text-[#8D6E63] font-medium">배경, 글귀, 귀여운 스티커로 네컷 사진을 예쁘게 꾸며주세요!</p>
          </div>

          {/* Controls Navigation Tabs */}
          <div className="flex border-2 border-[#FFE082] rounded-full overflow-hidden bg-[#FEF9E7]/40 p-1">
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'theme' ? 'bg-[#81C784] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#FEF9E7]/20'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>배경/레이아웃</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'text' ? 'bg-[#81C784] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#FEF9E7]/20'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>문구 꾸미기</span>
            </button>
            <button
              onClick={() => setActiveTab('sticker')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'sticker' ? 'bg-[#81C784] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#FEF9E7]/20'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>스티커 붙이기</span>
            </button>
          </div>

          {/* Tab 1: Layout & Background Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Theme selection */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-[#5D4037]">🎨 프레임 배경 테마 선택</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_THEMES.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption)}
                      style={{ backgroundColor: themeOption.bgColor }}
                      className={`relative p-3.5 rounded-2xl border-3 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        theme.id === themeOption.id ? 'border-[#81C784] scale-[1.03] shadow-md' : 'border-gray-100 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-2xl select-none">{themeOption.emoji}</span>
                      <span style={{ color: themeOption.textColor }} className="text-xs font-bold truncate max-w-full">
                        {themeOption.name}
                      </span>
                      {theme.id === themeOption.id && (
                        <div className="absolute top-1.5 right-1.5 bg-[#81C784] text-white rounded-full p-0.5 text-[8px] w-4.5 h-4.5 flex items-center justify-center border-2 border-white font-black">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Text Fields */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Class Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#8D6E63]">✏️ 타이틀 (반 이름)</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value.slice(0, 15))}
                  placeholder="반 이름을 적어주세요"
                  className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-[#81C784] focus:outline-none text-sm font-bold bg-gray-50"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#8D6E63]">📅 날짜 입력</label>
                <input
                  type="text"
                  value={footerDate}
                  onChange={(e) => setFooterDate(e.target.value.slice(0, 15))}
                  placeholder="예) 2026.07.07"
                  className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-[#81C784] focus:outline-none text-sm font-bold bg-gray-50 font-mono"
                />
              </div>

              {/* Cute slogan */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#8D6E63]">🧡 하단 한 줄 슬로건</label>
                <input
                  type="text"
                  value={footerSlogan}
                  onChange={(e) => setFooterSlogan(e.target.value.slice(0, 25))}
                  placeholder="예) 우리는 멋쟁이 단짝친구!"
                  className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-[#81C784] focus:outline-none text-sm font-bold bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Cute Stickers Selector & Mini Editor */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              {/* If a sticker is active, show its size/rotation control */}
              {selectedStickerId && (
                <div className="p-3 bg-[#F1F8E9] rounded-2xl border border-[#A5D6A7] flex items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {stickers.find((s) => s.id === selectedStickerId)?.emoji}
                    </span>
                    <span className="text-xs font-bold text-[#5D4037]">스티커 크기와 각도를 조절해요!</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Size Smaller */}
                    <button
                      onClick={() => {
                        const current = stickers.find((s) => s.id === selectedStickerId);
                        if (current) updateSticker(selectedStickerId, { scale: Math.max(0.4, current.scale - 0.15) });
                      }}
                      className="p-1.5 bg-white border border-[#A5D6A7] rounded-lg hover:bg-[#F1F8E9] transition text-[#5D4037] cursor-pointer"
                      title="작게"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    {/* Size Larger */}
                    <button
                      onClick={() => {
                        const current = stickers.find((s) => s.id === selectedStickerId);
                        if (current) updateSticker(selectedStickerId, { scale: Math.min(2.5, current.scale + 0.15) });
                      }}
                      className="p-1.5 bg-white border border-[#A5D6A7] rounded-lg hover:bg-[#F1F8E9] transition text-[#5D4037] cursor-pointer"
                      title="크게"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {/* Rotate Ccw */}
                    <button
                      onClick={() => {
                        const current = stickers.find((s) => s.id === selectedStickerId);
                        if (current) updateSticker(selectedStickerId, { rotation: (current.rotation - 15) % 360 });
                      }}
                      className="p-1.5 bg-white border border-[#A5D6A7] rounded-lg hover:bg-[#F1F8E9] transition text-[#5D4037] cursor-pointer"
                      title="왼쪽 회전"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    {/* Rotate Cw */}
                    <button
                      onClick={() => {
                        const current = stickers.find((s) => s.id === selectedStickerId);
                        if (current) updateSticker(selectedStickerId, { rotation: (current.rotation + 15) % 360 });
                      }}
                      className="p-1.5 bg-white border border-[#A5D6A7] rounded-lg hover:bg-[#F1F8E9] transition text-[#5D4037] flex items-center justify-center cursor-pointer"
                      title="오른쪽 회전"
                    >
                      <RotateCcw className="w-4 h-4 scale-x-[-1]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stickers category tabs */}
              <div className="flex border-b border-gray-100 pb-1 overflow-x-auto gap-2">
                {STICKER_CATEGORIES.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStickerCategory(idx)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
                      stickerCategory === idx ? 'bg-[#FEF9E7] border border-[#FFE082] text-[#5D4037]' : 'text-[#8D6E63] hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Stickers Grid */}
              <div className="grid grid-cols-6 gap-2.5 max-h-[180px] overflow-y-auto p-1 border-2 border-dashed border-gray-100 rounded-2xl">
                {STICKER_CATEGORIES[stickerCategory].stickers.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSticker(emoji)}
                    className="aspect-square bg-gray-50 hover:bg-[#FEF9E7] hover:scale-105 border border-gray-100 rounded-xl text-3xl flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <span className="filter drop-shadow-sm select-none">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Operations */}
          <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 border-2 border-[#FFE082] text-[#5D4037] hover:bg-[#FEF9E7]/20 font-bold rounded-full transition cursor-pointer"
            >
              이전 (사진 선택)
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onComplete(layout, theme, stickers, footerText, footerDate, footerSlogan)}
              className="px-8 py-3.5 bg-[#81C784] hover:bg-[#66BB6A] text-white font-extrabold text-lg rounded-full shadow-lg border-b-4 border-[#388E3C] flex items-center gap-2 transition duration-200 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>꾸미기 완료! 저장하기</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
}
