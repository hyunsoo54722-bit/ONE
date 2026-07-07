/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Award, Trash2 } from 'lucide-react';
import { Photo } from '../types';

interface PhotoSelectScreenProps {
  photos: Photo[];
  onSelectComplete: (selectedPhotos: Photo[]) => void;
  onRestart: () => void;
}

export default function PhotoSelectScreen({
  photos,
  onSelectComplete,
  onRestart,
}: PhotoSelectScreenProps) {
  // Store selected photo IDs in order of selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handlePhotoClick = (photoId: string) => {
    if (selectedIds.includes(photoId)) {
      // Remove from selection
      setSelectedIds(selectedIds.filter((id) => id !== photoId));
    } else {
      // Add to selection if less than 4
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, photoId]);
      } else {
        // If already 4, swap the first selection with this one
        // or prevent adding. Let's prevent and alert cute warning
        // but simple toggle is better: remove oldest, add new
        setSelectedIds([...selectedIds.slice(1), photoId]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length !== 4) return;
    
    // Map the selected IDs back to full photo objects in the custom order selected
    const orderedPhotos = selectedIds.map((id) => {
      const found = photos.find((p) => p.id === id);
      return found!;
    });
    
    onSelectComplete(orderedPhotos);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-[#5D4037]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white border-4 border-white rounded-[32px] p-6 shadow-xl text-center"
      >
        {/* Banner */}
        <div className="mb-6">
          <span className="text-4xl select-none">🌱</span>
          <h2 className="text-3xl font-black text-[#5D4037] mt-2">
            가장 예쁜 <span className="text-[#81C784]">사진 4장</span>을 골라주세요!
          </h2>
          <p className="text-sm text-[#8D6E63] mt-1.5 font-bold">
            사진을 누르는 순서대로 1번, 2번, 3번, 4번 칸에 들어갈 거예요! (현재: {selectedIds.length}/4장)
          </p>
        </div>

        {/* 5 Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-8">
          {photos.map((photo, index) => {
            const selectIndex = selectedIds.indexOf(photo.id);
            const isSelected = selectIndex !== -1;
            
            return (
              <motion.div
                key={photo.id}
                whileHover={{ scale: isSelected ? 1.02 : 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePhotoClick(photo.id)}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-300 ${
                  isSelected
                    ? 'border-[#FFD54F] shadow-lg scale-[1.02]'
                    : 'border-gray-100 hover:border-gray-200 shadow-sm opacity-80 hover:opacity-100'
                }`}
              >
                {/* Photo Image */}
                <img
                  src={photo.dataUrl}
                  alt={`촬영사진 ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />

                {/* Index Tag */}
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  촬영 {index + 1}
                </span>

                {/* Selection Badge Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#FFD54F] bg-opacity-10 border-4 border-[#FFD54F] rounded-xl flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-2 right-2 bg-[#FFD54F] text-[#5D4037] border-2 border-white rounded-full w-9 h-9 flex flex-col items-center justify-center font-extrabold shadow-md"
                    >
                      <span className="text-[10px] leading-none mb-0.5 font-bold">순서</span>
                      <span className="text-sm leading-none font-black">{selectIndex + 1}</span>
                    </motion.div>
                    
                    <div className="bg-[#81C784] text-white p-1 rounded-full shadow border border-white">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Help Message */}
        <div className="mb-6 py-2.5 px-5 rounded-full inline-block bg-[#FEF9E7] text-[#5D4037] text-sm font-bold border border-[#FFE082] shadow-xs">
          {selectedIds.length === 0 ? (
            <span>👇 사진을 하나씩 눌러보세요!</span>
          ) : selectedIds.length < 4 ? (
            <span>🐥 앞으로 {4 - selectedIds.length}장의 사진을 더 골라야 해요!</span>
          ) : (
            <span>⭐ 우와! 예쁜 네 컷이 모두 준비되었어요. 다음으로 가볼까요?</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-6 py-3.5 bg-white hover:bg-[#FEF9E7]/20 border-2 border-[#FFE082] text-[#5D4037] font-bold rounded-full flex items-center gap-1.5 shadow-sm transition duration-200"
          >
            <Trash2 className="w-5 h-5 text-[#8D6E63]" />
            <span>처음부터 다시 찍기</span>
          </button>
 
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length !== 4}
            className={`px-8 py-3.5 rounded-full font-extrabold text-lg flex items-center gap-2 shadow-md transition duration-200 ${
              selectedIds.length === 4
                ? 'bg-[#81C784] hover:bg-[#66BB6A] text-white border-b-4 border-[#388E3C] cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-b-4 border-gray-200 cursor-not-allowed'
            }`}
          >
            <span>선택 완료! 꾸미러 가기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
