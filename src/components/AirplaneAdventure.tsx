'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AirplaneAdventureProps {
  onBack: () => void;
  userProfile: any;
}

export default function AirplaneAdventure({ onBack }: AirplaneAdventureProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 bg-gray-900/95 backdrop-blur-sm border-blue-700">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              AIRPLANE ADVENTURE
            </h1>
            <h2 className="text-3xl font-bold text-white">
              Coming Soon!
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Epic aerial combat and exploration with legendary aircraft. 
              Pilot fighter jets, classic warbirds, and modern airliners through challenging missions!
            </p>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Planned Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Aircraft Types</h4>
                <ul className="space-y-1">
                  <li>• F-16 Falcon Fighter Jet</li>
                  <li>• P-51 Mustang Warbird</li>
                  <li>• Boeing 787 Airliner</li>
                  <li>• Steampunk Fantasy Ships</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Game Modes</h4>
                <ul className="space-y-1">
                  <li>• Obstacle Navigation</li>
                  <li>• Combat Missions</li>
                  <li>• Racing Challenges</li>
                  <li>• Exploration Mode</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={onBack}
            variant="outline"
            className="border-blue-600 text-blue-300 hover:bg-blue-800"
          >
            ← Back to Game Hub
          </Button>
        </div>
      </Card>
    </div>
  );
}