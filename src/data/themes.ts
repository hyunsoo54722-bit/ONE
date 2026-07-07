/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FrameTheme } from '../types';

export const PRESET_THEMES: FrameTheme[] = [
  {
    id: 'rainbow-sky',
    name: '푸른 하늘 무지개 🌈',
    emoji: '🌈',
    bgColor: '#E0F2FE', // sky-100
    borderColor: '#38BDF8', // sky-400
    textColor: '#0369A1', // sky-700
    pattern: 'stars',
    patternColor: 'rgba(56, 189, 248, 0.25)',
    decorations: [
      { emoji: '☁️', position: 'top-left', size: 'text-2xl' },
      { emoji: '🌈', position: 'top-right', size: 'text-3xl' },
      { emoji: '☁️', position: 'bottom-left', size: 'text-2xl' },
      { emoji: '☀️', position: 'bottom-right', size: 'text-3xl' },
    ],
  },
  {
    id: 'strawberry-garden',
    name: '새콤달콤 딸기밭 🍓',
    emoji: '🍓',
    bgColor: '#FFE4E6', // rose-100
    borderColor: '#FB7185', // rose-400
    textColor: '#BE123C', // rose-700
    pattern: 'dots',
    patternColor: 'rgba(251, 113, 133, 0.3)',
    decorations: [
      { emoji: '🍓', position: 'top-left', size: 'text-2xl' },
      { emoji: '🌸', position: 'top-right', size: 'text-2xl' },
      { emoji: '🍰', position: 'bottom-left', size: 'text-2xl' },
      { emoji: '🍓', position: 'bottom-right', size: 'text-3xl' },
    ],
  },
  {
    id: 'animal-friends',
    name: '기린과 동물 친구들 🦁',
    emoji: '🦁',
    bgColor: '#FEF3C7', // amber-100
    borderColor: '#FBBF24', // amber-400
    textColor: '#B45309', // amber-700
    pattern: 'stripes',
    patternColor: 'rgba(251, 191, 36, 0.2)',
    decorations: [
      { emoji: '🦁', position: 'top-left', size: 'text-3xl' },
      { emoji: '🦒', position: 'top-right', size: 'text-3xl' },
      { emoji: '🐰', position: 'bottom-left', size: 'text-2.5xl' },
      { emoji: '🐱', position: 'bottom-right', size: 'text-3xl' },
    ],
  },
  {
    id: 'green-sprout',
    name: '새싹 가득 초록반 🌱',
    emoji: '🌱',
    bgColor: '#DCFCE7', // green-100
    borderColor: '#4ADE80', // green-400
    textColor: '#15803D', // green-700
    pattern: 'dots',
    patternColor: 'rgba(74, 222, 128, 0.25)',
    decorations: [
      { emoji: '🌱', position: 'top-left', size: 'text-2xl' },
      { emoji: '🍀', position: 'top-right', size: 'text-2.5xl' },
      { emoji: '🌷', position: 'bottom-left', size: 'text-2.5xl' },
      { emoji: '🌼', position: 'bottom-right', size: 'text-3xl' },
    ],
  },
  {
    id: 'dreamy-night',
    name: '반짝반짝 은하수 ⭐️',
    emoji: '⭐️',
    bgColor: '#F3E8FF', // purple-100
    borderColor: '#C084FC', // purple-400
    textColor: '#6B21A8', // purple-700
    pattern: 'stars',
    patternColor: 'rgba(192, 132, 252, 0.3)',
    decorations: [
      { emoji: '🌙', position: 'top-left', size: 'text-2.5xl' },
      { emoji: '⭐️', position: 'top-right', size: 'text-3xl' },
      { emoji: '🪐', position: 'bottom-left', size: 'text-2.5xl' },
      { emoji: '✨', position: 'bottom-right', size: 'text-3xl' },
    ],
  },
  {
    id: 'classic-white',
    name: '심플 깔끔 하양 🤍',
    emoji: '🤍',
    bgColor: '#F9FAFB', // gray-50
    borderColor: '#E5E7EB', // gray-200
    textColor: '#374151', // gray-700
    pattern: 'solid',
    patternColor: 'rgba(0,0,0,0)',
    decorations: [
      { emoji: '🎈', position: 'top-left', size: 'text-2xl' },
      { emoji: '🧸', position: 'top-right', size: 'text-2.5xl' },
      { emoji: '📸', position: 'bottom-left', size: 'text-2.5xl' },
      { emoji: '❤️', position: 'bottom-right', size: 'text-2.5xl' },
    ],
  },
];

export const STICKER_CATEGORIES = [
  {
    name: '동물 친구들 🐰',
    stickers: ['🐰', '🐱', '🐶', '🐻', '🐼', '🦊', '🦁', '🐯', '🐨', '🐷', '🐸', '🐣', '🦖'],
  },
  {
    name: '자연과 요정 🌸',
    stickers: ['🌈', '☀️', '☁️', '🌸', '🍀', '🌻', '⭐', '🌙', '✨', '🎈', '💖', '🔥', '💧'],
  },
  {
    name: '맛있는 간식 🍭',
    stickers: ['🍭', '🍬', '🍓', '🍦', '🍰', '🍪', '🍕', '🍟', '🍩', '🍉', '🍌', '🍇', '🍒'],
  },
  {
    name: '멋진 꾸미기 🎀',
    stickers: ['🎀', '👓', '👑', '🎩', '🎨', '🚀', '📷', '🧸', '🎉', '🌟', '❤️', '🎶', '✌️'],
  },
];
