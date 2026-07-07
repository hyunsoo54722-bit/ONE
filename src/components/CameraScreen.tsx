/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, AlertCircle, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Photo } from '../types';
import { playTick, playShutter, playSuccess } from '../utils/audio';

interface CameraScreenProps {
  onCaptureComplete: (photos: Photo[]) => void;
  className: string;
}

export default function CameraScreen({ onCaptureComplete, className }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  
  const [isMirror, setIsMirror] = useState(true);
  const [isShooting, setIsShooting] = useState(false);
  const [currentShot, setCurrentShot] = useState(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlash, setIsFlash] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([]);
  const [statusMessage, setStatusMessage] = useState('준비 버틀을 눌러 사진 찍을 준비를 해보세요!');

  // Get list of cameras and request permission
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        setHasPermission(true);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Get devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (videoDevices.length > 0) {
          setActiveDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Camera permission denied or not found:', err);
        setHasPermission(false);
      }
    }

    initCamera();

    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Switch between cameras
  const switchCamera = async (deviceId: string) => {
    stopCameraStream();
    setActiveDeviceId(deviceId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  };

  const cycleCameras = () => {
    if (cameraDevices.length <= 1) return;
    const currentIndex = cameraDevices.findIndex((d) => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    switchCamera(cameraDevices[nextIndex].deviceId);
  };

  // The primary photo taking loop
  const startShootingFlow = async () => {
    if (isShooting) return;
    setIsShooting(true);
    setCapturedPhotos([]);
    setCurrentShot(0);
    takeNextShot(0, []);
  };

  const takeNextShot = (shotIndex: number, currentPhotos: Photo[]) => {
    setCurrentShot(shotIndex);
    setStatusMessage(`${shotIndex + 1}번째 사진 준비 완료!`);
    
    // 3, 2, 1 Countdown
    let count = 3;
    setCountdown(count);
    playTick();

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playTick();
      } else {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto(shotIndex, currentPhotos);
      }
    }, 1000);
  };

  const capturePhoto = (shotIndex: number, currentPhotos: Photo[]) => {
    if (!videoRef.current) return;

    // Trigger visual flash
    setIsFlash(true);
    playShutter();

    setTimeout(() => {
      setIsFlash(false);
    }, 150);

    // Grab video frame using canvas
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // We want highly clear portrait-style photos! Standard four-cut is 3:4 portrait or square.
    // Let's capture at 960x1280 (3:4 portrait ratio) or standard landscape 1280x960 cropped.
    // Let's crop the center of the video feed to make a beautiful 3:4 portrait photo.
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // We want 3:4 aspect ratio. Height is videoHeight, so width should be height * 3 / 4.
    const targetHeight = videoHeight;
    const targetWidth = (videoHeight * 3) / 4;
    
    canvas.width = 600;
    canvas.height = 800; // 3:4 proportion
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If mirrored, flip horizontally
      if (isMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      // Source crop coords: crop from horizontal center of video
      const sourceX = (videoWidth - targetWidth) / 2;
      const sourceY = 0;
      
      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        targetWidth,
        targetHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const newPhoto: Photo = {
        id: `photo-${Date.now()}-${shotIndex}`,
        dataUrl,
        createdAt: Date.now(),
      };

      const updatedPhotos = [...currentPhotos, newPhoto];
      setCapturedPhotos(updatedPhotos);

      // Check if finished taking 5 photos
      if (shotIndex < 4) {
        // Pause 1.8s for the kids to get ready for the next shot!
        setStatusMessage('다음 멋진 포즈를 취해보세요! 🐣');
        setTimeout(() => {
          takeNextShot(shotIndex + 1, updatedPhotos);
        }, 1800);
      } else {
        // All 5 photos taken! Play cute chime
        playSuccess();
        setStatusMessage('와! 5장의 사진을 모두 찍었어요! 🎉');
        setTimeout(() => {
          onCaptureComplete(updatedPhotos);
        }, 1500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-[#5D4037]">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Photo Status Bar (Desktop only, otherwise moves bottom) */}
        <div className="md:col-span-1 bg-white border-4 border-white rounded-[32px] p-5 flex flex-col justify-between shadow-xl h-fit min-h-[350px]">
          <div>
            <div className="text-center mb-5">
              <span className="text-3xl select-none">📸</span>
              <h2 className="text-lg font-extrabold text-[#5D4037] mt-1">촬영 현황판</h2>
              <p className="text-xs text-[#8D6E63]">총 5장을 찍어요!</p>
            </div>
            
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => {
                const isCaptured = capturedPhotos.length > index;
                const isActive = isShooting && currentShot === index && !isCaptured;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition-all duration-300 ${
                      isCaptured
                        ? 'bg-[#F1F8E9] border-[#A5D6A7] text-[#388E3C] font-bold'
                        : isActive
                        ? 'bg-[#FEF9E7] border-[#FFD54F] text-[#5D4037] font-bold animate-pulse scale-[1.03]'
                        : 'bg-gray-50/50 border-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 font-bold ${
                      isCaptured
                        ? 'bg-[#81C784] border-[#A5D6A7] text-white'
                        : isActive
                        ? 'bg-[#FFD54F] border-[#FFE082] text-[#5D4037]'
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">
                      {isCaptured ? '완료! 📸' : isActive ? '찰칵 준비!' : '대기 중..'}
                    </span>
                    {isCaptured && (
                      <CheckCircle2 className="w-4 h-4 ml-auto text-[#81C784]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-xs font-extrabold text-[#5D4037] bg-[#FEF9E7] px-3.5 py-1.5 rounded-full inline-block border border-[#FFE082]">
              우리반: {className} 🌱
            </span>
          </div>
        </div>

        {/* Center: Camera Capture Viewport */}
        <div className="md:col-span-3 flex flex-col items-center">
          
          {/* Status Alert Banner */}
          <div className="w-full mb-3 text-center px-4 py-2.5 bg-[#FEF9E7] border-2 border-[#FFE082] rounded-full text-sm font-bold text-[#5D4037] flex items-center justify-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FFD54F] animate-spin" />
            <span>{statusMessage}</span>
          </div>

          {/* Video Container Frame */}
          <div className="relative w-full aspect-[4/3] bg-neutral-900 border-8 border-white rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center">
            
            {hasPermission === false ? (
              <div className="p-6 text-center text-white space-y-4">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
                <h3 className="text-xl font-bold">카메라를 켤 수 없어요 😢</h3>
                <p className="text-sm text-gray-300 max-w-sm">
                  브라우저의 카메라 권한을 허용해 주시거나, 사용 가능한 카메라가 연결되어 있는지 확인해 주세요!
                </p>
              </div>
            ) : hasPermission === null ? (
              <div className="text-center text-white space-y-3">
                <div className="w-12 h-12 border-4 border-[#FFD54F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-medium">카메라를 준비하고 있어요...</p>
              </div>
            ) : (
              <>
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: isMirror ? 'scaleX(-1)' : 'none' }}
                  className="w-full h-full object-cover"
                />

                {/* Grid Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-[#FFD54F] border-opacity-30 rounded-[24px] m-4 flex items-center justify-center">
                  <div className="absolute top-4 left-4 text-[#5D4037] font-bold opacity-80 text-xs flex items-center gap-1 bg-[#FEF9E7] border border-[#FFE082] px-2.5 py-1.5 rounded-full shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                    <span>여기서 포즈를 잡아요!</span>
                  </div>
                </div>

                {/* Screen Flash Overlay */}
                <AnimatePresence>
                  {isFlash && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="absolute inset-0 bg-white z-40"
                    />
                  )}
                </AnimatePresence>

                {/* Count Down Overlay */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.8, opacity: 0 }}
                      key={countdown}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                      className="absolute z-30 flex items-center justify-center"
                    >
                      <div className="w-32 h-32 md:w-44 md:h-44 bg-[#FFD54F] rounded-full flex items-center justify-center text-[#5D4037] border-8 border-white shadow-2xl">
                        <span className="text-6xl md:text-8xl font-black font-sans leading-none select-none filter drop-shadow">
                          {countdown}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Action Controls */}
          <div className="mt-5 w-full flex flex-wrap items-center justify-center gap-4">
            {/* Mirror Toggle */}
            <button
              onClick={() => setIsMirror(!isMirror)}
              className="px-5 py-2.5 bg-white hover:bg-[#FEF9E7]/20 border-3 border-[#FFE082] text-[#5D4037] font-bold rounded-full flex items-center gap-2 shadow-sm transition duration-200"
            >
              <RefreshCw className="w-4 h-4 text-[#8D6E63]" />
              <span>좌우 반전 {isMirror ? '켜짐' : '꺼짐'}</span>
            </button>

            {/* Change Camera Toggle (if multiple cameras exist) */}
            {cameraDevices.length > 1 && (
              <button
                onClick={cycleCameras}
                className="px-5 py-2.5 bg-white hover:bg-[#FEF9E7]/20 border-3 border-[#FFE082] text-[#5D4037] font-bold rounded-full flex items-center gap-2 shadow-sm transition duration-200"
              >
                <Camera className="w-4 h-4 text-[#8D6E63]" />
                <span>카메라 전환</span>
              </button>
            )}

            {/* Primary START SHOOTING Button */}
            {!isShooting && hasPermission && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startShootingFlow}
                className="px-8 py-3.5 bg-[#81C784] hover:bg-[#66BB6A] text-white font-extrabold text-xl rounded-full shadow-lg border-b-4 border-[#388E3C] flex items-center gap-2.5 transition duration-200"
              >
                <Camera className="w-6 h-6 animate-pulse" />
                <span>찰칵! 촬영 시작하기 🌿</span>
              </motion.button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
