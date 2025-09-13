'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { InGameCopyright } from '@/components/CopyrightNotice';

interface DigitalArtStudioProps {
  onBack: () => void;
  userProfile: any;
}

interface DrawingTool {
  type: 'brush' | 'pencil' | 'eraser' | 'fill';
  size: number;
  color: string;
  opacity: number;
}

export default function DigitalArtStudio({ onBack }: DigitalArtStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'brush',
    size: 5,
    color: '#000000',
    opacity: 100
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState('My Artwork');
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [lastTouchPos, setLastTouchPos] = useState<{x: number, y: number} | null>(null);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF8000', '#8000FF', '#0080FF', '#80FF00',
    '#FF0080', '#808080', '#C0C0C0', '#800000', '#008000', '#000080',
    '#808000', '#800080', '#008080', '#FF4500', '#32CD32', '#4169E1',
    '#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#20B2AA'
  ];

  useEffect(() => {
    // Check if mobile
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size based on device
        canvas.width = isMobile ? 400 : 800;
        canvas.height = isMobile ? 300 : 600;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Save initial state
        saveToHistory();
      }
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = drawingHistory.slice(0, historyStep + 1);
        newHistory.push(imageData);
        setDrawingHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      }
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && drawingHistory[historyStep - 1]) {
          ctx.putImageData(drawingHistory[historyStep - 1], 0, 0);
        }
      }
    }
  };

  const redo = () => {
    if (historyStep < drawingHistory.length - 1) {
      setHistoryStep(historyStep + 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && drawingHistory[historyStep + 1]) {
          ctx.putImageData(drawingHistory[historyStep + 1], 0, 0);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent | React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (canvas: HTMLCanvasElement, e: React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getMousePos(canvas, e);
      draw(pos.x, pos.y, true);
    }
  };

  const draw = (x: number, y: number, isStart: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalAlpha = currentTool.opacity / 100;
    ctx.lineWidth = currentTool.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (currentTool.type) {
      case 'brush':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentTool.color;
        break;
      case 'pencil':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentTool.color;
        ctx.lineWidth = Math.max(1, currentTool.size / 2);
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        break;
    }

    if (isStart) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getMousePos(canvas, e);
      draw(pos.x, pos.y);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastTouchPos(null);
      saveToHistory();
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getTouchPos(canvas, e);
      setLastTouchPos(pos);
      draw(pos.x, pos.y, true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getTouchPos(canvas, e);
      if (lastTouchPos) {
        draw(pos.x, pos.y);
      }
      setLastTouchPos(pos);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const downloadArtwork = (format: 'png' | 'jpg' | 'pdf') => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (format === 'pdf') {
        // Create PDF download
        downloadAsPDF();
      } else {
        // Clean download without watermark
        const link = document.createElement('a');
        link.download = `${artworkTitle}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.95);
        link.click();
      }
    }
  };

  const downloadAsPDF = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a new window with the canvas as PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = window.open('', '_blank');
      if (pdf) {
        pdf.document.write(`
          <html>
            <head>
              <title>${artworkTitle} - © 2025 Justin Devon Mitchell</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
                .copyright { margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <h1>${artworkTitle}</h1>
              <img src="${imgData}" alt="${artworkTitle}" />
              <div class="copyright">© 2025 Justin Devon Mitchell - Digital Art Creation</div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        pdf.document.close();
      }
    }
  };

  const generateShareableLink = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const blob = dataURLToBlob(dataURL);
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link for sharing
      const shareData = {
        title: artworkTitle,
        text: `Check out my digital artwork: ${artworkTitle}`,
        url: url
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`Check out my artwork: ${url}`).then(() => {
          alert('Shareable link copied to clipboard!');
        });
      }
    }
  };

  const dataURLToBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
              JUSTIN DEVON MITCHELL ART STUDIO
            </h1>
            <input 
              type="text"
              value={artworkTitle}
              onChange={(e) => setArtworkTitle(e.target.value)}
              className="mt-2 px-3 py-1 bg-gray-800 text-white rounded border border-gray-600"
              placeholder="Artwork Title"
            />
          </div>
          <Button 
            onClick={onBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            ← Back to Hub
          </Button>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-12'} gap-4`}>
          {/* Tools Panel */}
          <Card className={`${isMobile ? 'col-span-1' : 'col-span-3'} p-4 bg-gray-900/95 border-green-700`}>
            <h3 className="text-lg font-bold text-green-400 mb-4">🎨 Tools</h3>
            
            {/* Tool Selection */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={currentTool.type === 'brush' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool({...currentTool, type: 'brush'})}
                  className="text-xs"
                >
                  🖌️ Brush
                </Button>
                <Button 
                  variant={currentTool.type === 'pencil' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool({...currentTool, type: 'pencil'})}
                  className="text-xs"
                >
                  ✏️ Pencil
                </Button>
                <Button 
                  variant={currentTool.type === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool({...currentTool, type: 'eraser'})}
                  className="text-xs"
                >
                  🧹 Eraser
                </Button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-300">Size: {currentTool.size}px</label>
              <Slider
                value={[currentTool.size]}
                onValueChange={(value) => setCurrentTool({...currentTool, size: value[0]})}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-300">Opacity: {currentTool.opacity}%</label>
              <Slider
                value={[currentTool.opacity]}
                onValueChange={(value) => setCurrentTool({...currentTool, opacity: value[0]})}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2 mb-6">
              <label className="text-sm text-gray-300">Color</label>
              <div 
                className="w-full h-10 rounded border-2 border-gray-600 cursor-pointer"
                style={{ backgroundColor: currentTool.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              
              {showColorPicker && (
                <div className="grid grid-cols-6 gap-1 p-2 bg-gray-800 rounded">
                  {colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-white"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setCurrentTool({...currentTool, color});
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={undo} variant="outline" className="text-xs">
                  ↶ Undo
                </Button>
                <Button size="sm" onClick={redo} variant="outline" className="text-xs">
                  ↷ Redo
                </Button>
              </div>
              <Button size="sm" onClick={clearCanvas} variant="outline" className="w-full text-xs">
                🗑️ Clear
              </Button>
            </div>
          </Card>

          {/* Canvas Area */}
          <Card className={`${isMobile ? 'col-span-1 order-first' : 'col-span-6'} p-4 bg-gray-900/95 border-green-700 relative`}>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-600 rounded cursor-crosshair bg-white touch-none"
                style={{ maxWidth: '100%', maxHeight: isMobile ? '300px' : '600px' }}
                onMouseDown={startDrawing}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
            <InGameCopyright />
          </Card>

          {/* Export Panel */}
          <Card className={`${isMobile ? 'col-span-1' : 'col-span-3'} p-4 bg-gray-900/95 border-green-700`}>
            <h3 className="text-lg font-bold text-green-400 mb-4">💾 Export</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={() => downloadArtwork('png')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                📥 Download PNG
              </Button>
              <Button 
                onClick={() => downloadArtwork('jpg')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                📥 Download JPG
              </Button>
              <Button 
                onClick={() => downloadArtwork('pdf')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                📄 Download PDF
              </Button>
              <Button 
                onClick={generateShareableLink}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                🔗 Share Artwork
              </Button>
            </div>

            <div className="mt-6 p-3 bg-green-900/30 rounded text-xs text-gray-300">
              <h4 className="font-semibold text-green-400 mb-2">✨ Features</h4>
              <ul className="space-y-1">
                <li>• Multiple brush tools</li>
                <li>• Adjustable size & opacity</li>
                <li>• 30 color palette</li>
                <li>• Undo/Redo system</li>
                <li>• Free downloads</li>
                <li>• Shareable links</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-yellow-900/30 rounded text-xs text-gray-300">
              <h4 className="font-semibold text-yellow-400 mb-2">🎯 Tips</h4>
              <ul className="space-y-1">
                <li>• Use low opacity for blending</li>
                <li>• Try different brush sizes</li>
                <li>• Save frequently with downloads</li>
                <li>• Share your masterpieces!</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-4 bg-gray-900/95 border-green-700">
          <div className="text-center text-gray-300">
            <h4 className="font-semibold text-green-400 mb-2">🎨 How to Use Digital Art Studio</h4>
            <p className="text-sm">
              Select your tool and color, then click and drag on the canvas to create your artwork. 
              Use different brush sizes and opacity levels for varied effects. 
              Download your finished artwork as PNG or JPG, or generate a shareable link to showcase your creation!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}