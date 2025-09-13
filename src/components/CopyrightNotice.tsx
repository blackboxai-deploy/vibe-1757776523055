'use client';

import { Card } from '@/components/ui/card';

export default function CopyrightNotice() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 text-white py-3 px-4 text-center text-xs border-t-2 border-yellow-500 z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="font-bold text-yellow-400 text-sm">
            © 2025 JUSTIN DEVON MITCHELL
          </span>
          <span className="text-red-400 font-semibold">
            ALL RIGHTS RESERVED ®
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-gray-300">
          <span className="font-semibold">FIGHTER SHOOTER ART GAME</span>
          <span>•</span>
          <span>ORIGINAL CREATION</span>
        </div>
        
        <div className="flex items-center gap-2 text-red-400 font-semibold">
          <span>COPYRIGHTED CONTENT</span>
          <span className="text-yellow-400">™</span>
        </div>
      </div>
    </div>
  );
}

export function GameCopyrightHeader() {
  return (
    <div className="bg-black/90 text-white py-4 px-4 text-center border-b-2 border-yellow-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="text-xl font-bold text-yellow-400">
            © 2025 JUSTIN DEVON MITCHELL
          </div>
          <div className="text-sm text-gray-200 font-semibold">
            ORIGINAL GAME CREATION • ALL RIGHTS RESERVED
          </div>
          <div className="text-sm text-red-400 font-bold">
            COPYRIGHTED CONTENT ® ™
          </div>
        </div>
        <div className="text-xs text-gray-300 mt-2 font-medium">
          This game and all its content, including characters, mechanics, art, and code, are protected by copyright law. 
          Unauthorized reproduction, distribution, or modification is strictly prohibited.
        </div>
        <div className="text-xs text-yellow-300 mt-1">
          <strong>DMCA PROTECTED</strong> • <strong>CONTACT: justinmitchell6789@gmail.com</strong>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          510 Bazinsky Rd Apt 1D • Original Creation by Justin Devon Mitchell
        </div>
      </div>
    </div>
  );
}

export function InGameCopyright() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Card className="bg-black/95 text-white px-4 py-3 border-2 border-yellow-500 shadow-xl">
        <div className="text-sm font-bold text-yellow-400">
          © 2025 JUSTIN DEVON MITCHELL
        </div>
        <div className="text-xs text-red-400 font-semibold">
          ALL RIGHTS RESERVED ® ™
        </div>
        <div className="text-xs text-gray-300 mt-1">
          justinmitchell6789@gmail.com
        </div>
        <div className="text-xs text-gray-400">
          510 Bazinsky Rd Apt 1D
        </div>
      </Card>
    </div>
  );
}

export function CopyrightWatermark() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <div className="text-6xl font-bold text-white/5 transform rotate-45 select-none">
        © 2025 JUSTIN DEVON MITCHELL
      </div>
    </div>
  );
}