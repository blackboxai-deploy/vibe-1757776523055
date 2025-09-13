'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FightNightLegends from '@/components/FightNightLegends';
import HelicopterCombat from '@/components/HelicopterCombat';
import DigitalArtStudio from '@/components/DigitalArtStudio';
import MusicPlayer from '@/components/MusicPlayer';
import MusicStudio from '@/components/MusicStudio';
import CopyrightNotice, { GameCopyrightHeader } from '@/components/CopyrightNotice';

type GameMode = 'hub' | 'fight-night' | 'helicopter' | 'art-studio';

export default function GameHub() {
  const [currentGame, setCurrentGame] = useState<GameMode>('hub');
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showMusicStudio, setShowMusicStudio] = useState(false);
  const [userProfile] = useState({
    name: 'Player',
    totalScore: 0,
    achievements: [],
    artworkCount: 0,
    fightsWon: 0,
    flightHours: 0
  });

  if (currentGame === 'fight-night') {
    return (
      <>
        <FightNightLegends 
          onBack={() => setCurrentGame('hub')} 
          userProfile={userProfile}
        />
        <MusicPlayer 
          isVisible={showMusicPlayer}
          onToggleVisibility={() => setShowMusicPlayer(!showMusicPlayer)}
        />
        <MusicStudio 
          isVisible={showMusicStudio}
          onToggleVisibility={() => setShowMusicStudio(!showMusicStudio)}
        />
      </>
    );
  }

  if (currentGame === 'helicopter') {
    return (
      <>
        <HelicopterCombat 
          onBack={() => setCurrentGame('hub')} 
          userProfile={userProfile}
        />
        <MusicPlayer 
          isVisible={showMusicPlayer}
          onToggleVisibility={() => setShowMusicPlayer(!showMusicPlayer)}
        />
        <MusicStudio 
          isVisible={showMusicStudio}
          onToggleVisibility={() => setShowMusicStudio(!showMusicStudio)}
        />
      </>
    );
  }

  if (currentGame === 'art-studio') {
    return (
      <>
        <DigitalArtStudio 
          onBack={() => setCurrentGame('hub')} 
          userProfile={userProfile}
        />
        <MusicPlayer 
          isVisible={showMusicPlayer}
          onToggleVisibility={() => setShowMusicPlayer(!showMusicPlayer)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <GameCopyrightHeader />
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Card className="w-full max-w-6xl p-8 bg-gray-900/95 backdrop-blur-sm border-gray-700">
        <div className="text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-7xl font-bold text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 bg-clip-text animate-pulse">
              © JUSTIN DEVON MITCHELL
            </h1>
            <h2 className="text-3xl font-bold text-white">
              FIGHTER SHOOTER ART GAME ™
            </h2>
            <div className="text-lg font-semibold text-red-400">
              © 2025 ALL RIGHTS RESERVED
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The ultimate copyrighted gaming trilogy by Justin Devon Mitchell: Fight legendary boxers with supernatural powers, 
              pilot helicopters through epic combat, and create masterpiece artwork with professional tools.
            </p>
          </div>

          {/* User Profile */}
          <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to Justin Devon Mitchell's Game Collection!</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{userProfile.totalScore}</div>
                <div className="text-gray-300">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{userProfile.fightsWon}</div>
                <div className="text-gray-300">Fights Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{userProfile.flightHours}</div>
                <div className="text-gray-300">Flight Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{userProfile.artworkCount}</div>
                <div className="text-gray-300">Artworks</div>
              </div>
            </div>
          </div>

          {/* Game Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fight Night Legends */}
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-red-900/50 to-orange-800/50 border-red-500/30 cursor-pointer overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="text-6xl mb-4">🥊</div>
                <h3 className="text-2xl font-bold text-red-400">FIGHT NIGHT</h3>
                <h4 className="text-xl text-white">LEGENDS</h4>
                <p className="text-gray-300 text-sm">
                  Battle legendary boxers with supernatural abilities. Mike Tyson, Ali, Holyfield and more!
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>🏆 Champions:</span>
                    <span>6 Legendary Boxers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚡ Special Moves:</span>
                    <span>Fireball Attacks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎮 Mode:</span>
                    <span>Tournament & VS</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentGame('fight-night')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  ENTER THE RING
                </Button>
              </div>
            </Card>

            {/* Helicopter Combat */}
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-900/50 to-cyan-800/50 border-blue-500/30 cursor-pointer overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="text-6xl mb-4">🚁</div>
                <h3 className="text-2xl font-bold text-blue-400">HELICOPTER</h3>
                <h4 className="text-xl text-white">COMBAT</h4>
                <p className="text-gray-300 text-sm">
                  Pilot combat helicopter through intense aerial battles. Destroy enemies, collect coins!
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>🚁 Aircraft:</span>
                    <span>Combat Helicopter</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎯 Enemies:</span>
                    <span>Fighter Jets & Bombers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🪙 Rewards:</span>
                    <span>Coins & Fireballs</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentGame('helicopter')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  START MISSION
                </Button>
              </div>
            </Card>

            {/* Digital Art Studio */}
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-900/50 to-emerald-800/50 border-green-500/30 cursor-pointer overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold text-green-400">DIGITAL ART</h3>
                <h4 className="text-xl text-white">STUDIO</h4>
                <p className="text-gray-300 text-sm">
                  Create masterpiece artwork with professional tools. Download your creations for free!
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>🖌️ Tools:</span>
                    <span>Brushes & Shapes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎨 Features:</span>
                    <span>Layers & Colors</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💾 Export:</span>
                    <span>PNG, SVG, PDF</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentGame('art-studio')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  START CREATING
                </Button>
              </div>
            </Card>

            {/* Music Studio */}
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-900/50 to-pink-800/50 border-purple-500/30 cursor-pointer overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="text-6xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold text-purple-400">MUSIC</h3>
                <h4 className="text-xl text-white">STUDIO</h4>
                <p className="text-gray-300 text-sm">
                  Record your voice, add auto-tune effects, create beats, and download for free!
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>🎤 Recording:</span>
                    <span>Voice + Auto-tune</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🥁 Beats:</span>
                    <span>4 Beat Styles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💾 Export:</span>
                    <span>Free WAV Downloads</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowMusicStudio(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  START RECORDING
                </Button>
              </div>
            </Card>
          </div>

          {/* Features Highlight */}
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-bold text-white">✨ Premium Features</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center space-y-2">
                <div className="text-2xl">🎵</div>
                <h4 className="font-semibold text-yellow-400">Dynamic Audio</h4>
                <p className="text-gray-300">Immersive soundtracks and effects for each game</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">📱</div>
                <h4 className="font-semibold text-blue-400">Mobile Ready</h4>
                <p className="text-gray-300">Touch controls optimized for all devices</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">🔗</div>
                <h4 className="font-semibold text-green-400">Shareable</h4>
                <p className="text-gray-300">Share your artwork and achievements online</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">🚀</div>
                <h4 className="font-semibold text-red-400">High Performance</h4>
                <p className="text-gray-300">Smooth 60fps gaming experience</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-center text-gray-400 text-sm">
            <p>🎮 <strong>4 Complete Experiences</strong> • 🥊 <strong>6 Boxing Legends</strong> • 🚁 <strong>Helicopter Combat</strong> • 🎨 <strong>Professional Art Tools</strong> • 🎤 <strong>Music Studio</strong></p>
            <p className="mt-2">Built with Next.js, TypeScript, Canvas API, Web Audio API, and MediaRecorder API</p>
            <p className="mt-1 text-purple-400">🎵 <strong>Custom Music Player + Recording Studio</strong> - Upload songs, record with auto-tune!</p>
          </div>
        </div>
      </Card>
      </div>
      
      <MusicPlayer 
        isVisible={showMusicPlayer}
        onToggleVisibility={() => setShowMusicPlayer(!showMusicPlayer)}
      />
      
      <MusicStudio 
        isVisible={showMusicStudio}
        onToggleVisibility={() => setShowMusicStudio(!showMusicStudio)}
      />
      
      <CopyrightNotice />
    </div>
  );
}