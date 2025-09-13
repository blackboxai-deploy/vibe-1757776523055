'use client';

import { useEffect, useRef, useState } from 'react';
import { FightingGameEngine } from '@/lib/game-engine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function FightingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<FightingGameEngine | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [masterVolume, setMasterVolume] = useState(30);
  const [sfxVolume, setSfxVolume] = useState(50);

  useEffect(() => {
    // Check if mobile
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameStarted && canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new FightingGameEngine(canvasRef.current);
      gameEngineRef.current.start();

      // Add restart functionality
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') {
          gameEngineRef.current?.restart();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
    };
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
  };

  const restartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
    }
  };

  const handleMasterVolumeChange = (value: number[]) => {
    const vol = value[0];
    setMasterVolume(vol);
    if (gameEngineRef.current) {
      // Access audio manager through game engine
      (gameEngineRef.current as any).audioManager?.setMasterVolume(vol / 100);
    }
  };

  const handleSfxVolumeChange = (value: number[]) => {
    const vol = value[0];
    setSfxVolume(vol);
    if (gameEngineRef.current) {
      // Access audio manager through game engine
      (gameEngineRef.current as any).audioManager?.setSFXVolume(vol / 100);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8 bg-gray-900/90 backdrop-blur-sm border-gray-700">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text">
                STREET FIGHTER
              </h1>
              <h2 className="text-3xl font-bold text-white">
                ARENA
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Enter the ultimate fighting arena! Master combos, unleash special moves, 
                and prove your skills in intense 1v1 combat.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-blue-400 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-bold">
                    P1
                  </span>
                  Player 1 Controls
                </h3>
                <div className="space-y-2 text-gray-300">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Move: <kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd></span>
                    <span>Light Attack: <kbd className="bg-gray-700 px-2 py-1 rounded">G</kbd></span>
                    <span>Block: <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd></span>
                    <span>Heavy Attack: <kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd></span>
                    <span className="col-span-2">Special Move: <kbd className="bg-gray-700 px-2 py-1 rounded">T</kbd> (Ice Projectile)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-red-400 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-500 rounded text-white flex items-center justify-center text-sm font-bold">
                    P2
                  </span>
                  Player 2 Controls
                </h3>
                <div className="space-y-2 text-gray-300">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Move: <kbd className="bg-gray-700 px-2 py-1 rounded">Arrows</kbd></span>
                    <span>Light Attack: <kbd className="bg-gray-700 px-2 py-1 rounded">K</kbd></span>
                    <span>Block: <kbd className="bg-gray-700 px-2 py-1 rounded">O</kbd></span>
                    <span>Heavy Attack: <kbd className="bg-gray-700 px-2 py-1 rounded">L</kbd></span>
                    <span className="col-span-2">Special Move: <kbd className="bg-gray-700 px-2 py-1 rounded">I</kbd> (Fire Projectile)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-yellow-400">Game Features</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Combat System</h4>
                  <ul className="space-y-1">
                    <li>• Frame-based attacks</li>
                    <li>• Combo system</li>
                    <li>• Block mechanics</li>
                    <li>• Invincibility frames</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Special Moves</h4>
                  <ul className="space-y-1">
                    <li>• Energy-based system</li>
                    <li>• Projectile attacks</li>
                    <li>• Particle effects</li>
                    <li>• Screen shake</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Game Modes</h4>
                  <ul className="space-y-1">
                    <li>• Best of 3 rounds</li>
                    <li>• 99-second timer</li>
                    <li>• Health/Energy bars</li>
                    <li>• Victory conditions</li>
                  </ul>
                </div>
              </div>
            </div>

            {isMobile && (
              <div className="bg-orange-900/50 border border-orange-500/50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-400 mb-2">Mobile Controls</h4>
                <p className="text-sm text-orange-200">
                  Touch controls will appear on screen when you start the game. 
                  Use the virtual buttons for movement and attacks.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button 
                onClick={startGame}
                size="lg"
                className="text-xl px-12 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                START FIGHTING!
              </Button>
              
              <div className="flex justify-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowControls(!showControls)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {showControls ? 'Hide' : 'Show'} Advanced Tips
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAudioControls(!showAudioControls)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  🎵 Audio Settings
                </Button>
              </div>

              {showControls && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-left space-y-3 text-sm text-gray-300">
                  <h4 className="font-semibold text-white">Advanced Fighting Tips:</h4>
                  <ul className="space-y-1">
                    <li>• <strong>Combo System:</strong> Chain attacks within 1 second to increase damage</li>
                    <li>• <strong>Energy Management:</strong> Special moves consume energy, which regenerates over time</li>
                    <li>• <strong>Blocking:</strong> Hold block to reduce damage by 70% but still take knockback</li>
                    <li>• <strong>Invincibility:</strong> After being hit, you have brief invincibility frames</li>
                    <li>• <strong>Projectiles:</strong> Special moves create projectiles that travel across the screen</li>
                    <li>• <strong>Victory:</strong> First to win 2 rounds wins the match</li>
                    <li>• <strong>Timer:</strong> If time runs out, the fighter with more health wins the round</li>
                    <li>• <strong>Restart:</strong> Press 'R' at any time to restart the match</li>
                  </ul>
                </div>
              )}

              {showAudioControls && (
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg space-y-4">
                  <h4 className="font-semibold text-blue-400 flex items-center gap-2">
                    🎵 Audio Controls
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Master Volume: {masterVolume}%
                      </label>
                      <Slider
                        value={[masterVolume]}
                        onValueChange={handleMasterVolumeChange}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Sound Effects Volume: {sfxVolume}%
                      </label>
                      <Slider
                        value={[sfxVolume]}
                        onValueChange={handleSfxVolumeChange}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>🎼 <strong>Background Music:</strong> Dynamic fighting theme with chord progressions</p>
                      <p>🥊 <strong>Sound Effects:</strong> Punches, kicks, special moves, hits, blocks, and victory fanfare</p>
                      <p>🎛️ <strong>Audio Engine:</strong> Real-time synthesized audio using Web Audio API</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Street Fighter Arena</h1>
        <p className="text-gray-300">Best of 3 Rounds - Press R to restart</p>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-600 rounded-lg shadow-2xl max-w-full h-auto"
          style={{
            maxWidth: '100vw',
            maxHeight: '60vh'
          }}
        />
        
        {isMobile && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-xs text-gray-400 text-center">
              Use touch controls on screen • Hold for continuous input
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          onClick={restartGame}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Restart Game
        </Button>
        <Button 
          onClick={() => setGameStarted(false)}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Back to Menu
        </Button>
        <Button 
          onClick={() => setShowAudioControls(!showAudioControls)}
          variant="outline"
          className="border-blue-600 text-blue-300 hover:bg-blue-800/30"
        >
          🎵 Audio
        </Button>
      </div>

      {showAudioControls && (
        <div className="w-full max-w-md mx-auto p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Master: {masterVolume}%
            </label>
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              SFX: {sfxVolume}%
            </label>
            <Slider
              value={[sfxVolume]}
              onValueChange={handleSfxVolumeChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="text-center space-y-2 max-w-4xl">
        <div className="grid grid-cols-2 gap-8 text-sm text-gray-400">
          <div>
            <h4 className="text-blue-400 font-semibold mb-1">Player 1 (Blue)</h4>
            <p>Ice Fighter - WASD Movement</p>
            <p>G: Light • H: Heavy • T: Special • R: Block</p>
          </div>
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Player 2 (Red)</h4>
            <p>Fire Fighter - Arrow Movement</p>
            <p>K: Light • L: Heavy • I: Special • O: Block</p>
          </div>
        </div>
      </div>
    </div>
  );
}