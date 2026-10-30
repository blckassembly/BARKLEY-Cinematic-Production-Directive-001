/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Camera,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Layers,
  X,
  Monitor,
  CreditCard,
  Hand,
  ShoppingCart,
} from 'lucide-react';
import { CameraMode, TOTAL_DURATION, TOTAL_FRAMES, FPS, WORKFLOW_STEPS, WorkflowStep } from '../scene/types';
import { UPLOADED_SCREENS } from '../scene/screenTextures';

interface DirectorSuiteProps {
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  cameraMode: CameraMode;
  lensMm: number;
  shotName: string;
  shotDescription: string;
  stepNumber: string;
  isMuted: boolean;
  isCollapsed: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSeek: (time: number) => void;
  onStepFrame: (direction: number) => void;
  onChangeSpeed: (speed: number) => void;
  onChangeCameraMode: (mode: CameraMode) => void;
  onToggleMute: () => void;
  onToggleCollapse: () => void;
  onExportSnapshot: () => void;
}

export const DirectorSuite: React.FC<DirectorSuiteProps> = ({
  currentTime,
  isPlaying,
  playbackSpeed,
  cameraMode,
  lensMm,
  shotName,
  shotDescription,
  stepNumber,
  isMuted,
  isCollapsed,
  onTogglePlay,
  onReplay,
  onSeek,
  onStepFrame,
  onChangeSpeed,
  onChangeCameraMode,
  onToggleMute,
  onToggleCollapse,
  onExportSnapshot,
}) => {
  const [showScreenInspector, setShowScreenInspector] = useState<boolean>(false);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);

  const currentFrame = Math.min(TOTAL_FRAMES, Math.floor(currentTime * FPS));

  const formatTime = (time: number) => {
    const totalSeconds = Math.max(0, Math.min(TOTAL_DURATION, time));
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const hundredths = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths
      .toString()
      .padStart(2, '0')}`;
  };

  // Find active step
  let activeStep = WORKFLOW_STEPS[0];
  for (let i = WORKFLOW_STEPS.length - 1; i >= 0; i--) {
    if (currentTime >= WORKFLOW_STEPS[i].startTime) {
      activeStep = WORKFLOW_STEPS[i];
      break;
    }
  }

  return (
    <>
      {/* Top Architectural HUD */}
      <div className="absolute top-0 left-0 right-0 p-5 pointer-events-none flex justify-between items-start z-20">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-xl tracking-widest font-bold text-white uppercase">
              BARKLEY
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-300">
              Interactive 27" POS Checkout Simulation
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-mono-tabular">
            <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/70 border border-emerald-800/60 rounded">
              STEP {activeStep.number} OF 12
            </span>
            <span className="text-white font-semibold">{activeStep.name}</span>
            <span>·</span>
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-emerald-400 inline" />
              {activeStep.actionText}
            </span>
          </div>
        </div>

        {/* Top Right Buttons */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSeek(75.5)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-900/90 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-500/70 shadow-md transition-all cursor-pointer hover:border-emerald-400"
              title="Jump directly to checkout animation sequence"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cart Summary Animation (76s)</span>
            </button>

            <button
              onClick={() => {
                setSelectedScreenIndex(activeStep.screenIndex);
                setShowScreenInspector(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/95 hover:bg-zinc-800 text-zinc-100 text-xs font-medium rounded-lg border border-zinc-700/80 shadow-md transition-all cursor-pointer hover:border-zinc-500"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-300" />
              <span>Inspect All 12 Screens</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/85 border border-zinc-800 rounded-lg text-xs font-mono-tabular text-zinc-300">
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span>{cameraMode === 'free' ? '360° Orbit' : `${lensMm}mm Lens`}</span>
            </div>
          </div>

          <span className="text-xs text-zinc-400 max-w-md text-right truncate">
            {shotName} — {shotDescription}
          </span>
        </div>
      </div>

      {/* Screen Inspector Modal (Inspect any of the 12 screens at 100% full scale) */}
      {showScreenInspector && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <span className="font-cinzel text-lg font-bold text-white tracking-widest">
                  BARKLEY 27" SCREEN FLOW INSPECTOR
                </span>
                <span className="text-xs text-zinc-400">
                  Full 12-Step Checkout Experience
                </span>
              </div>
              <button
                onClick={() => setShowScreenInspector(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Screen List Sidebar */}
              <div className="w-full md:w-80 border-r border-zinc-800 p-4 overflow-y-auto flex flex-col gap-2 bg-zinc-950/50">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Workflow Stages (12)
                </span>
                {UPLOADED_SCREENS.map((scr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScreenIndex(idx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedScreenIndex === idx
                        ? 'bg-zinc-800 border-emerald-500 text-white shadow-sm'
                        : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-12 h-16 bg-zinc-800 rounded overflow-hidden shrink-0 border border-zinc-700">
                      <img
                        src={scr.path}
                        alt={scr.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {scr.title}
                      </span>
                      <span className="text-[11px] text-zinc-400">{scr.category}</span>
                      <span className="text-[10px] text-emerald-400 mt-1">
                        Active in POS
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Preview Box */}
              <div className="flex-1 bg-zinc-950 p-6 flex flex-col items-center justify-center overflow-auto relative">
                <div className="h-[92%] aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden border-4 border-zinc-800 shadow-2xl relative flex items-center justify-center">
                  <img
                    src={UPLOADED_SCREENS[selectedScreenIndex]?.path}
                    alt={UPLOADED_SCREENS[selectedScreenIndex]?.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 rounded-full text-xs text-white border border-white/20 font-mono-tabular">
                    27-inch Portrait (1080 x 1920) · Mapped on Kiosk Display Glass
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom Control Dock */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl z-20 transition-transform duration-300 ease-out ${
          isCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center mb-1">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-t-md border-t border-x border-zinc-700/60 shadow-lg cursor-pointer transition-colors"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Cinema View (H)</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-700/60 rounded-xl p-4 shadow-2xl flex flex-col gap-3">
          {/* 12 Workflow Step Buttons */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 pb-1 border-b border-zinc-800/80">
            {WORKFLOW_STEPS.map((st) => {
              const isActive =
                currentTime >= st.startTime && currentTime < st.endTime;
              return (
                <button
                  key={st.id}
                  onClick={() => onSeek(st.startTime)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 border border-emerald-500 text-white shadow-xs'
                      : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`${st.number}. ${st.name}`}
                >
                  <span className="text-[10px] font-mono-tabular font-bold text-emerald-400">
                    {st.number}
                  </span>
                  <span className="text-[10px] font-medium leading-tight truncate w-full">
                    {st.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrubber & Timecode */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono-tabular">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  {formatTime(currentTime)}
                </span>
                <span className="text-zinc-500">/</span>
                <span className="text-zinc-400">{formatTime(TOTAL_DURATION)}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">
                  Frame {currentFrame} / {TOTAL_FRAMES}
                </span>
              </div>

              <div className="text-zinc-400 text-xs">
                <span>Display: </span>
                <span className="text-emerald-400 font-semibold">
                  {UPLOADED_SCREENS[activeStep.screenIndex]?.title}
                </span>
              </div>
            </div>

            {/* Draggable Scrubber */}
            <div className="relative w-full h-4 flex items-center group cursor-pointer">
              <input
                type="range"
                min="0"
                max={TOTAL_DURATION}
                step="0.05"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              />

              {WORKFLOW_STEPS.map((st, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-zinc-500/80 rounded-full pointer-events-none"
                  style={{ left: `${(st.startTime / TOTAL_DURATION) * 100}%` }}
                  title={`${st.number}. ${st.name}`}
                />
              ))}
            </div>
          </div>

          {/* Lower Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800">
            {/* Transport */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onReplay}
                title="Replay from start (R)"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStepFrame(-1)}
                title="Previous frame (Left arrow)"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                title="Play/Pause (Space)"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span className="text-xs uppercase tracking-wider font-semibold">
                  {isPlaying ? 'Pause' : 'Play Simulation'}
                </span>
              </button>

              <button
                onClick={() => onStepFrame(1)}
                title="Next frame (Right arrow)"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Speed */}
              <div className="flex items-center gap-1 ml-1 bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/40">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeed(s)}
                    className={`px-2 py-1 text-[11px] font-mono-tabular font-medium rounded transition-colors cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-zinc-700 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angles */}
            <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/40 text-xs">
              <button
                onClick={() => onChangeCameraMode('cinematic')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                  cameraMode === 'cinematic'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cinematic
              </button>
              <button
                onClick={() => onChangeCameraMode('screen_focus')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-medium ${
                  cameraMode === 'screen_focus'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Screen Focus</span>
              </button>
              <button
                onClick={() => onChangeCameraMode('hardware_focus')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-medium ${
                  cameraMode === 'hardware_focus'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Hardware</span>
              </button>
              <button
                onClick={() => onChangeCameraMode('free')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                  cameraMode === 'free'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>360° Orbit</span>
              </button>
            </div>

            {/* Utilities */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Audio (Haptic Touch Chimes)' : 'Mute Audio'}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onExportSnapshot}
                title="Export High-Res Frame Snapshot (PNG)"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Frame</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
