/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, RotateCcw, Share2, Sparkles, CheckCircle, Printer } from 'lucide-react';
import { Photo, FrameLayout, FrameTheme, PlacedSticker } from '../types';

interface ExportScreenProps {
  layout: FrameLayout;
  theme: FrameTheme;
  selectedPhotos: Photo[];
  stickers: PlacedSticker[];
  footerText: string;
  footerDate: string;
  footerSlogan: string;
  onRestart: () => void;
}

export default function ExportScreen({
  layout,
  theme,
  selectedPhotos,
  stickers,
  footerText,
  footerDate,
  footerSlogan,
  onRestart,
}: ExportScreenProps) {
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function drawAndExport() {
      try {
        // 1. Set dimensions based on layout (High resolution for crisp prints)
        const canvas = document.createElement('canvas');
        const width = layout === 'vertical' ? 1000 : 1200;
        const height = layout === 'vertical' ? 2800 : 1500;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');
        
        // 2. Draw background color
        ctx.fillStyle = theme.bgColor;
        ctx.fillRect(0, 0, width, height);

        // 3. Draw background patterns
        const pColor = theme.patternColor;
        if (theme.pattern === 'dots') {
          const spacing = 52;
          ctx.fillStyle = pColor;
          for (let x = 26; x < width + 26; x += spacing) {
            for (let y = 26; y < height + 26; y += spacing) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (theme.pattern === 'stripes') {
          ctx.strokeStyle = pColor;
          ctx.lineWidth = 14;
          const spacing = 72;
          for (let offset = -height; offset < width; offset += spacing) {
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset + height, height);
            ctx.stroke();
          }
        } else if (theme.pattern === 'stars') {
          ctx.fillStyle = pColor;
          const spacing = 96;
          for (let x = 32; x < width; x += spacing) {
            for (let y = 32; y < height; y += spacing) {
              // Draw small sparkles
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillRect(x - 8, y - 1, 16, 2);
              ctx.fillRect(x - 1, y - 8, 2, 16);
            }
          }
        }

        // 4. Load photos asynchronously
        const loadImg = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
          });
        };

        const loadedPhotos = await Promise.all(
          selectedPhotos.map((photo) => loadImg(photo.dataUrl))
        );

        // 5. Draw 4 Photos
        if (layout === 'vertical') {
          // Vertical Margins and Positioning
          const sideMargin = 70;
          const topMargin = 110;
          const photoGap = 45;
          const photoWidth = width - sideMargin * 2; // 860px
          const photoHeight = 540; // nicely fits 4:3 cropped portrait ratio

          loadedPhotos.forEach((img, idx) => {
            const py = topMargin + idx * (photoHeight + photoGap);
            
            // Draw photo container shadow / white border
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(sideMargin - 12, py - 12, photoWidth + 24, photoHeight + 24);
            
            // Draw photo
            ctx.drawImage(img, sideMargin, py, photoWidth, photoHeight);

            // Draw index text inside photo
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(sideMargin + photoWidth - 60, py + photoHeight - 40, 45, 30);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(idx + 1), sideMargin + photoWidth - 37, py + photoHeight - 25);
          });
        } else {
          // 2x2 Grid Margins and Positioning
          const sideMargin = 80;
          const topMargin = 110;
          const photoGap = 40;
          
          const colWidth = (width - sideMargin * 2 - photoGap) / 2; // 500px
          const rowHeight = 520; // Aspect ratio is beautifully portrait 500:520 (nearly 1:1 square-ish)

          loadedPhotos.forEach((img, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const px = sideMargin + col * (colWidth + photoGap);
            const py = topMargin + row * (rowHeight + photoGap);

            // Draw photo container shadow / white border
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px - 12, py - 12, colWidth + 24, rowHeight + 24);

            // Draw photo
            ctx.drawImage(img, px, py, colWidth, rowHeight);

            // Draw index text inside photo
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(px + colWidth - 60, py + rowHeight - 40, 45, 30);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(idx + 1), px + colWidth - 37, py + rowHeight - 25);
          });
        }

        // 6. Draw Built-in Frame Theme Emoji Decorations
        theme.decorations.forEach((dec) => {
          let dx = 0;
          let dy = 0;
          const fontSize = 72; // High-res font size

          if (layout === 'vertical') {
            if (dec.position === 'top-left') { dx = 80; dy = 70; }
            else if (dec.position === 'top-right') { dx = width - 80; dy = 70; }
            else if (dec.position === 'bottom-left') { dx = 80; dy = height - 320; }
            else if (dec.position === 'bottom-right') { dx = width - 80; dy = height - 320; }
          } else {
            // For 2x2 grid
            if (dec.position === 'top-left') { dx = 90; dy = 70; }
            else if (dec.position === 'top-right') { dx = width - 90; dy = 70; }
            else if (dec.position === 'bottom-left') { dx = 90; dy = height - 260; }
            else if (dec.position === 'bottom-right') { dx = width - 90; dy = height - 260; }
          }

          if (dx && dy) {
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dec.emoji, dx, dy);
          }
        });

        // 7. Draw Footer Info Texts
        const footerY = layout === 'vertical' ? height - 150 : height - 120;
        
        ctx.textAlign = 'center';
        
        // Custom Title text
        ctx.fillStyle = theme.textColor;
        ctx.font = 'black 54px Arial, sans-serif';
        ctx.fillText(footerText || '우리반 네컷', width / 2, footerY - 35);

        // Cute slogan text
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText(footerSlogan, width / 2, footerY + 22);

        // Date text
        ctx.font = 'bold 24px Courier New, monospace';
        ctx.fillText(footerDate, width / 2, footerY + 70);

        // 8. Draw Placed Custom Stickers
        stickers.forEach((s) => {
          const pixelX = (s.x / 100) * width;
          const pixelY = (s.y / 100) * height;

          ctx.save();
          ctx.translate(pixelX, pixelY);
          ctx.rotate((s.rotation * Math.PI) / 180);
          
          const finalStickerSize = 90 * s.scale; // high-res base scale (90px)
          ctx.font = `${finalStickerSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.emoji, 0, 0);
          ctx.restore();
        });

        // 9. Convert Canvas to beautiful high-quality PNG
        const url = canvas.toDataURL('image/png', 1.0);
        setRenderedImageUrl(url);
        setIsCompiling(false);
      } catch (err) {
        console.error('Failed to compile composite image:', err);
        setIsCompiling(false);
      }
    }

    drawAndExport();
  }, [layout, theme, selectedPhotos, stickers, footerText, footerDate, footerSlogan]);

  // Download trigger
  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.href = renderedImageUrl;
    link.download = `${footerText.replace(/[\s\W]+/g, '_')}_우리반네컷.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct print option
  const handlePrint = () => {
    if (!renderedImageUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>우리반 네컷 - 인쇄하기</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; max-height: 98vh; object-fit: contain; }
              @media print {
                body { margin: 0; }
                img { max-width: 100%; max-height: 100vh; }
              }
            </style>
          </head>
          <body>
            <img src="${renderedImageUrl}" onload="window.print();window.close()"/>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Copy Image Link / Share
  const handleShare = async () => {
    if (!renderedImageUrl) return;
    try {
      // Since it's a blob dataURL, we can convert it to file and share it!
      const res = await fetch(renderedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'photo.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '우리반 네컷 사진',
          text: '유치원에서 찍은 귀여운 우리반 네컷 사진이에요!',
        });
      } else {
        // Fallback: Copy to clipboard or alert success
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (e) {
      console.warn('Sharing failed', e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-[#5D4037]">
      {isCompiling ? (
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-[#81C784] border-t-transparent rounded-full animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-xl select-none">🌱</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#5D4037]">우리의 네컷 사진을 예쁘게 인화하고 있어요...</h3>
          <p className="text-sm text-[#8D6E63] font-bold">멋진 액자가 곧 완성됩니다! 조금만 기다려주세요 🧸</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl bg-white border-4 border-white rounded-[32px] p-6 shadow-2xl"
        >
          {/* Header Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F1F8E9] border border-[#A5D6A7] rounded-full text-[#388E3C] text-sm font-bold shadow-sm mb-2">
              <CheckCircle className="w-4 h-4 text-[#81C784]" />
              <span>와! 우리만의 네컷 사진 인쇄 완료! 🎉</span>
            </div>
            <h2 className="text-3xl font-black text-[#5D4037] mt-1">네컷 사진관 <span className="text-[#81C784]">배달이 왔어요!</span></h2>
            <p className="text-xs text-[#8D6E63] font-bold mt-1">예쁜 사진을 컴퓨터나 핸드폰에 저장하거나 직접 인쇄해 보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Frame: High-Res rendered image showcase (5 cols) */}
            <div className="md:col-span-5 flex justify-center">
              {renderedImageUrl && (
                <div className="p-3 bg-[#FEF9E7]/40 border-2 border-[#FFE082] rounded-[24px] shadow-inner max-w-full">
                  <img
                    src={renderedImageUrl}
                    alt="인화된 우리반 네컷 사진"
                    className={`rounded-lg object-contain shadow-md mx-auto ${
                      layout === 'vertical' ? 'max-h-[500px]' : 'max-h-[350px]'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Right Frame: Download & Share actions (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-[#FEF9E7] p-5 rounded-[24px] border-2 border-[#FFE082]">
                <h4 className="text-base font-extrabold text-[#5D4037] flex items-center gap-1 mb-2">
                  <Sparkles className="w-5 h-5 text-[#FFD54F]" />
                  <span>우리반 액자 보관 요령!</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#8D6E63] font-bold list-disc pl-5">
                  <li><strong>컴퓨터에 저장하기:</strong> 아래 '파일로 저장하기' 버튼을 누르면 다운로드 폴더에 들어가요.</li>
                  <li><strong>프린터로 뽑기:</strong> '직접 프린트하기' 버튼을 눌러 교실 게시판에 붙여보세요!</li>
                  <li><strong>스마트폰/패드 전달:</strong> '친구에게 공유하기'를 눌러 링크나 이미지를 가족들에게 보내봐요.</li>
                </ul>
              </div>

              {/* Major Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Download File */}
                <button
                  onClick={handleDownload}
                  className="py-4 bg-[#81C784] hover:bg-[#66BB6A] text-white font-extrabold text-lg rounded-full shadow-lg border-b-4 border-[#388E3C] flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>파일로 저장하기 💾</span>
                </button>

                {/* Print File */}
                <button
                  onClick={handlePrint}
                  className="py-4 bg-[#FFD54F] hover:bg-[#FFCA28] text-[#5D4037] font-extrabold text-lg rounded-full shadow-lg border-b-4 border-[#F57F17] flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                >
                  <Printer className="w-5 h-5" />
                  <span>직접 프린트하기 🖨️</span>
                </button>
              </div>

              {/* Sub controls: Share and Re-take */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleShare}
                  className={`w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-[#FFE082] hover:bg-[#FEF9E7]/20 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    copySuccess ? 'text-green-600 border-green-300 bg-green-50' : 'text-[#5D4037]'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copySuccess ? '주소 복사 성공! 👍' : '친구에게 공유하기'}</span>
                </button>

                <button
                  onClick={onRestart}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-[#FFE082] hover:bg-[#FEF9E7]/20 text-[#5D4037] font-extrabold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#8D6E63]" />
                  <span>새로운 네컷 사진 찍기 🔄</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
