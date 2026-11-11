/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraMode, TOTAL_DURATION, FPS } from './scene/types';
import { initThreeScene, SceneManager } from './scene/sceneManager';
import { audioSynth } from './scene/audioSynth';
import { DirectorSuite } from './components/DirectorSuite';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);

  // Master Director State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('cinematic');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHandVisible, setIsHandVisible] = useState<boolean>(false);

  // Active Camera & Shot Info for HUD
  const [cameraInfo, setCameraInfo] = useState<{
    lensMm: number;
    shotName: string;
    description: string;
    stepNumber: string;
    activeUiStateName?: string;
  }>({
    lensMm: 45,
    shotName: '01. Entrance & Wall POS (0:00–0:20)',
    description: 'Enter the 500 sq ft boutique dispensary through the front door; the Barley POS is mounted directly on the wall.',
    stepNumber: '01',
    activeUiStateName: '01. Welcome to Barley',
  });

  // Keep ref for use in animation loop without tearing down
  const stateRef = useRef({
    currentTime: 0,
    isPlaying: true,
    playbackSpeed: 1.0,
    cameraMode: 'cinematic' as CameraMode,
  });

  useEffect(() => {
    stateRef.current.currentTime = currentTime;
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.playbackSpeed = playbackSpeed;
    stateRef.current.cameraMode = cameraMode;
  }, [currentTime, isPlaying, playbackSpeed, cameraMode]);

  // Direct Seek Handler
  const handleSeek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, time));
    setCurrentTime(clamped);
    stateRef.current.currentTime = clamped;
    if (sceneManagerRef.current) {
      const info = sceneManagerRef.current.render(clamped, stateRef.current.cameraMode);
      setCameraInfo(info);
    }
  }, []);

  const handleStepFrame = useCallback(
    (direction: number) => {
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      const dt = direction * (1 / FPS);
      handleSeek(stateRef.current.currentTime + dt);
    },
    [handleSeek]
  );

  const handleReplay = useCallback(() => {
    handleSeek(0);
    setIsPlaying(true);
    stateRef.current.isPlaying = true;
  }, [handleSeek]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      stateRef.current.isPlaying = next;
      // If restarting from end, reset to 0
      if (next && stateRef.current.currentTime >= TOTAL_DURATION) {
        handleSeek(0);
      }
      return next;
    });
  }, [handleSeek]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioSynth.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleHand = useCallback(() => {
    if (!sceneManagerRef.current) return;
    const next = sceneManagerRef.current.toggleHand();
    setIsHandVisible(next);
  }, []);

  const handleExportSnapshot = useCallback(() => {
    if (!sceneManagerRef.current) return;
    const dataUrl = sceneManagerRef.current.captureSnapshot();
    const frameNumber = Math.floor(stateRef.current.currentTime * FPS);
    const link = document.createElement('a');
    link.download = `barley-directive-001-frame-${frameNumber.toString().padStart(4, '0')}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'KeyR':
          e.preventDefault();
          handleReplay();
          break;
        case 'KeyV':
          e.preventDefault();
          handleToggleHand();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleStepFrame(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleStepFrame(1);
          break;
        case 'KeyH':
          e.preventDefault();
          setIsCollapsed((prev) => !prev);
          break;
        case 'Digit1':
          setCameraMode('cinematic');
          break;
        case 'Digit2':
          setCameraMode('screen_focus');
          break;
        case 'Digit3':
          setCameraMode('hardware_focus');
          break;
        case 'Digit4':
          setCameraMode('free');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleReplay, handleStepFrame]);

  // Three.js Lifecycle & Animation Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const sceneManager = initThreeScene(canvas);
    sceneManagerRef.current = sceneManager;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      sceneManager.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    lastTimestampRef.current = performance.now();

    const loop = (timestamp: number) => {
      const rawDt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      const dt = Math.min(rawDt, 0.1); // Clamp to prevent spikes

      if (stateRef.current.isPlaying) {
        let nextTime = stateRef.current.currentTime + dt * stateRef.current.playbackSpeed;
        if (nextTime >= TOTAL_DURATION) {
          // Pause at end frame 600 or smooth loop
          nextTime = TOTAL_DURATION;
          setIsPlaying(false);
          stateRef.current.isPlaying = false;
        }
        stateRef.current.currentTime = nextTime;
        setCurrentTime(nextTime);
      }

      // Render deterministic frame
      const info = sceneManager.render(
        stateRef.current.currentTime,
        stateRef.current.cameraMode
      );
      setCameraInfo(info);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      sceneManager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            sceneManagerRef.current?.handlePointerDown(e.clientX, e.clientY);
          }}
          className="w-full h-full block touch-none cursor-pointer"
        />
      </div>

      {/* Director Suite Controls & Cinema HUD */}
      <DirectorSuite
        currentTime={currentTime}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        cameraMode={cameraMode}
        lensMm={cameraInfo.lensMm}
        shotName={cameraInfo.shotName}
        shotDescription={cameraInfo.description}
        stepNumber={cameraInfo.stepNumber}
        activeUiStateName={cameraInfo.activeUiStateName}
        isMuted={isMuted}
        isCollapsed={isCollapsed}
        isHandVisible={isHandVisible}
        onTogglePlay={handleTogglePlay}
        onReplay={handleReplay}
        onSeek={handleSeek}
        onStepFrame={handleStepFrame}
        onChangeSpeed={setPlaybackSpeed}
        onChangeCameraMode={setCameraMode}
        onToggleMute={handleToggleMute}
        onToggleHand={handleToggleHand}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onExportSnapshot={handleExportSnapshot}
      />
    </div>
  );
}
