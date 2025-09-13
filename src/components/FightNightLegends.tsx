'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FightNightEngine } from '@/lib/fight-night-engine';
import { InGameCopyright, CopyrightWatermark } from '@/components/CopyrightNotice';

interface FightNightLegendsProps {
  onBack: () => void;
  userProfile: any;
}

export default function FightNightLegends({ onBack, userProfile }: FightNightLegendsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<FightNightEngine | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  const legendaryBoxers = [
    {
      id: 'mike-tyson',
      name: 'Mike Tyson',
      nickname: 'The Destroyer',
      specialMove: 'Lightning Punch',
      stats: { power: 95, speed: 85, stamina: 80 },
      description: 'The youngest heavyweight champion with devastating knockout power',
      color: '#000000'
    },
    {
      id: 'muhammad-ali',
      name: 'Muhammad Ali',
      nickname: 'The Greatest',
      specialMove: 'Float Like Butterfly',
      stats: { power: 80, speed: 95, stamina: 90 },
      description: 'The greatest boxer of all time with unmatched footwork',
      color: '#FFD700'
    },
    {
      id: 'evander-holyfield',
      name: 'Evander Holyfield',
      nickname: 'The Real Deal',
      specialMove: 'Holy Fire Uppercut',
      stats: { power: 85, speed: 80, stamina: 95 },
      description: 'Four-time heavyweight champion with incredible heart',
      color: '#FF4444'
    },
    {
      id: 'rocky-balboa',
      name: 'Rocky Balboa',
      nickname: 'Italian Stallion',
      specialMove: 'Rocky Thunder Strike',
      stats: { power: 75, speed: 70, stamina: 100 },
      description: 'The underdog champion who never gives up',
      color: '#8B4513'
    },
    {
      id: 'sugar-ray-leonard',
      name: 'Sugar Ray Leonard',
      nickname: 'Sweet Science',
      specialMove: 'Sugar Rush Flurry',
      stats: { power: 70, speed: 100, stamina: 85 },
      description: 'Master of the sweet science with lightning combinations',
      color: '#FF69B4'
    },
    {
      id: 'george-foreman',
      name: 'George Foreman',
      nickname: 'Big George',
      specialMove: 'Foreman Grill Slam',
      stats: { power: 100, speed: 60, stamina: 75 },
      description: 'Devastating punching power that can end fights instantly',
      color: '#CD853F'
    }
  ];

  useEffect(() => {
    if (gameStarted && canvasRef.current && !gameEngineRef.current && selectedFighter) {
      gameEngineRef.current = new FightNightEngine(canvasRef.current, selectedFighter);
      gameEngineRef.current.start();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') {
          gameEngineRef.current?.restart();
        }
        if (e.key === 'Escape') {
          setGameStarted(false);
          setShowCharacterSelect(false);
          setSelectedFighter(null);
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
  }, [gameStarted, selectedFighter]);

  const selectFighter = (fighterId: string) => {
    setSelectedFighter(fighterId);
    setGameStarted(true);
    setShowCharacterSelect(false);
  };

  const startFighting = () => {
    setShowCharacterSelect(true);
  };

  const goBack = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
      gameEngineRef.current = null;
    }
    setGameStarted(false);
    setShowCharacterSelect(false);
    setSelectedFighter(null);
    onBack();
  };

  // Character Selection Screen
  if (showCharacterSelect && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-red-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl p-8 bg-gray-900/95 backdrop-blur-sm border-red-700">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text">
                CHOOSE YOUR FIGHTER
              </h1>
              <p className="text-xl text-gray-300">
                Select your legendary boxer and enter the ring of legends
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
              {legendaryBoxers.map((boxer) => (
                <Card 
                  key={boxer.id}
                  className="group hover:scale-105 transition-all duration-300 bg-gray-800/50 border-gray-600 cursor-pointer overflow-hidden"
                  onClick={() => selectFighter(boxer.id)}
                >
                  <div className="p-6 space-y-4">
                    {/* Fighter Portrait */}
                    <div 
                      className="w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center text-4xl font-bold"
                      style={{ 
                        backgroundColor: boxer.color + '33', 
                        borderColor: boxer.color,
                        color: boxer.color
                      }}
                    >
                      🥊
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">{boxer.name}</h3>
                      <h4 className="text-lg text-gray-300">"{boxer.nickname}"</h4>
                      <p className="text-sm text-gray-400">{boxer.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Power</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-3 h-3 rounded ${i < Math.floor(boxer.stats.power / 20) ? 'bg-red-500' : 'bg-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Speed</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-3 h-3 rounded ${i < Math.floor(boxer.stats.speed / 20) ? 'bg-yellow-500' : 'bg-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Stamina</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-3 h-3 rounded ${i < Math.floor(boxer.stats.stamina / 20) ? 'bg-green-500' : 'bg-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-center">
                      <div className="text-sm font-semibold text-yellow-400">Special Move:</div>
                      <div className="text-sm text-white">{boxer.specialMove}</div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
                    >
                      SELECT FIGHTER
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setShowCharacterSelect(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Game Screen
  if (gameStarted) {
    const selectedBoxer = legendaryBoxers.find(b => b.id === selectedFighter);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">JUSTIN DEVON MITCHELL</h1>
          <h2 className="text-2xl font-bold text-yellow-400">FIGHTER LEGENDS</h2>
          <p className="text-gray-300">
            Fighting as: <span className="text-yellow-400 font-bold">{selectedBoxer?.name}</span> "{selectedBoxer?.nickname}"
          </p>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-4 border-red-600 rounded-lg shadow-2xl max-w-full h-auto"
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
            Restart Fight
          </Button>
          <Button 
            onClick={() => {
              setGameStarted(false);
              setShowCharacterSelect(true);
            }}
            variant="outline"
            className="border-blue-600 text-blue-300 hover:bg-blue-800/30"
          >
            Change Fighter
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
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-400">
            <div>
              <h4 className="text-red-400 font-semibold mb-1">Boxing Controls</h4>
              <p>WASD: Move • G: Jab • H: Hook • T: Uppercut • R: Block</p>
            </div>
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Special Moves</h4>
              <p>Y: {selectedBoxer?.specialMove} • Build meter with combos!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-red-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl p-8 bg-gray-900/95 backdrop-blur-sm border-red-700">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text">
              JUSTIN DEVON MITCHELL
            </h1>
            <h2 className="text-4xl font-bold text-white">
              FIGHTER LEGENDS
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Step into the ring with legendary boxers enhanced with supernatural abilities! 
              Master boxing fundamentals while unleashing devastating fireball attacks.
            </p>
          </div>

          {/* Featured Boxers Preview */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl">👑</div>
              <h3 className="text-xl font-bold text-yellow-400">Mike Tyson</h3>
              <p className="text-sm text-gray-300">Lightning-fast devastating punches</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🦋</div>
              <h3 className="text-xl font-bold text-yellow-400">Muhammad Ali</h3>
              <p className="text-sm text-gray-300">Float like butterfly, sting like bee</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🔥</div>
              <h3 className="text-xl font-bold text-yellow-400">Evander Holyfield</h3>
              <p className="text-sm text-gray-300">Holy fire uppercut attacks</p>
            </div>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={startFighting}
              size="lg"
              className="text-2xl px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              🥊 ENTER THE RING
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

          {/* Game Features */}
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-red-400 mb-4">Game Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Boxing Mechanics</h4>
                <ul className="space-y-1">
                  <li>• Realistic boxing stances and footwork</li>
                  <li>• Jabs, hooks, uppercuts, and combos</li>
                  <li>• Blocking and dodging systems</li>
                  <li>• Stamina and health management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Supernatural Powers</h4>
                <ul className="space-y-1">
                  <li>• Unique fireball attacks per fighter</li>
                  <li>• Special meter builds with combos</li>
                  <li>• Devastating finishing moves</li>
                  <li>• Particle effects and screen shake</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}