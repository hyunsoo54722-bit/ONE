/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Photo {
  id: string;
  dataUrl: string;
  createdAt: number;
}

export type FrameLayout = 'vertical' | 'grid2x2';

export interface FrameTheme {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  pattern: 'solid' | 'stripes' | 'dots' | 'stars';
  patternColor: string;
  decorations: {
    emoji: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'footer-left' | 'footer-right';
    size: string;
  }[];
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number; // percentage from left of frame (0 - 100)
  y: number; // percentage from top of frame (0 - 100)
  scale: number; // scale multiplier
  rotation: number; // in degrees
}

export type AppPhase = 'welcome' | 'shooting' | 'selection' | 'editing' | 'export';
