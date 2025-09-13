'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HelicopterEngine } from '@/lib/helicopter-engine';
import { InGameCopyright, CopyrightWatermark } from '@/components/CopyrightNotice';

interface HelicopterCombatProps {
  onBack: () => void;
  userProfile: any;
}

export default function HelicopterCombat({ onBack }: HelicopterCombatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<HelicopterEngine | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({
    score: 0,
    coins: 0,
    enemiesDestroyed: 0,
    level: 1
  });

  useEffect(() => {
    if (gameStarted && canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new HelicopterEngine(canvasRef.current, (stats) => {
        setGameStats(stats);
      });
      gameEngineRef.current.start();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') {
          gameEngineRef.current?.restart();
          setGameStats({ score: 0, coins: 0, enemiesDestroyed: 0, level: 1 });
        }
        if (e.key === 'Escape') {
          setGameStarted(false);
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

  const goBack = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
      gameEngineRef.current = null;
    }
    setGameStarted(false);
    onBack();
  };

  // Game Screen
  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">JUSTIN DEVON MITCHELL</h1>
          <h2 className="text-2xl font-bold text-cyan-400">SHOOTER COMBAT</h2>
          <div className="flex gap-8 text-lg">
            <p className="text-cyan-300">Score: <span className="text-yellow-400 font-bold">{gameStats.score}</span></p>
            <p className="text-cyan-300">Coins: <span className="text-orange-400 font-bold">🪙 {gameStats.coins}</span></p>
            <p className="text-cyan-300">Enemies: <span className="text-red-400 font-bold">{gameStats.enemiesDestroyed}</span></p>
            <p className="text-cyan-300">Level: <span className="text-green-400 font-bold">{gameStats.level}</span></p>
          </div>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-4 border-cyan-600 rounded-lg shadow-2xl max-w-full h-auto bg-gradient-to-b from-sky-400 to-blue-600"
            style={{
              maxWidth: '100vw',
              maxHeight: '70vh'
            }}
          />
          <InGameCopyright />
          <CopyrightWatermark />
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Button 
            onClick={() => gameEngineRef.current?.restart()}
            variant="outline"
            className="border-yellow-600 text-yellow-300 hover:bg-yellow-800/30"
          >
            Restart Mission
          </Button>
          <Button 
            onClick={goBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Exit to Hub
          </Button>
        </div>

        <div className="text-center space-y-2 max-w-4xl">
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-300">
            <div>
              <h4 className="text-cyan-400 font-semibold mb-1">Flight Controls</h4>
              <p>WASD: Move Helicopter • SPACE: Fire Missiles</p>
            </div>
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Combat Tips</h4>
              <p>Destroy enemies with fireballs to earn coins!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl p-8 bg-gray-900/95 backdrop-blur-sm border-cyan-700">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text">
              JUSTIN DEVON MITCHELL
            </h1>
            <h2 className="text-4xl font-bold text-white">
              SHOOTER COMBAT
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Pilot your combat helicopter through intense aerial battles! 
              Destroy enemy aircraft with fireball missiles and collect coins for each victory.
            </p>
          </div>

          {/* Game Features */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl">🚁</div>
              <h3 className="text-xl font-bold text-cyan-400">Combat Helicopter</h3>
              <p className="text-sm text-gray-300">Agile military helicopter with fireball weapons</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">✈️</div>
              <h3 className="text-xl font-bold text-cyan-400">Enemy Aircraft</h3>
              <p className="text-sm text-gray-300">Various enemy planes with different attack patterns</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🪙</div>
              <h3 className="text-xl font-bold text-cyan-400">Coin Collection</h3>
              <p className="text-sm text-gray-300">Earn coins for every enemy destroyed</p>
            </div>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={startGame}
              size="lg"
              className="text-2xl px-12 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              🚁 START MISSION
            </Button>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={goBack}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                ← Back to Game Hub
              </Button>
            </div>
          </div>

          {/* Game Features Details */}
          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">Combat Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Helicopter Combat</h4>
                <ul className="space-y-1">
                  <li>• Smooth flight controls with inertia</li>
                  <li>• Fireball missile attacks</li>
                  <li>• Enemy aircraft with AI patterns</li>
                  <li>• Coin collection system</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Progression System</h4>
                <ul className="space-y-1">
                  <li>• Score tracking and high scores</li>
                  <li>• Increasing difficulty levels</li>
                  <li>• Enemy variety and spawn rates</li>
                  <li>• Visual effects and explosions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}