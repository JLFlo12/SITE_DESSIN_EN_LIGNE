import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Download, Users, Settings, UserX } from 'lucide-react';

interface DrawingCanvasProps {
  currentColor: string;
  brushSize: number;
  brushOpacity: number;
  tool: 'brush' | 'eraser';
  canvasFormat: string;
  activeLayer: number;
  layers: Array<{ id: number; name: string; opacity: number; visible: boolean }>;
  connectedUsers: Array<{ id: string; name: string; role: 'editor' | 'observer'; cursor: { x: number; y: number } }>;
  isHost: boolean;
  onUserRoleChange: (userId: string, role: 'editor' | 'observer') => void;
  onUserKick: (userId: string) => void;
  initialImageData?: string;
  onChange?: () => void;
}

export const DrawingCanvas = ({
  currentColor,
  brushSize,
  brushOpacity,
  tool,
  canvasFormat,
  activeLayer,
  layers,
  connectedUsers,
  isHost,
  onUserRoleChange,
  onUserKick,
  initialImageData,
  onChange
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [lastDrawPoint, setLastDrawPoint] = useState({ x: 0, y: 0 });

  const getCanvasSize = (format: string) => {
    const canvasFormats = {
      '16:9': { width: 1200, height: 675 },
      '4:3': { width: 1200, height: 900 },
      'carré': { width: 900, height: 900 },
      'portrait': { width: 900, height: 1200 },
      'A4': { width: 1191, height: 1684 }
    };

    // Check if it's a predefined format
    if (canvasFormats[format as keyof typeof canvasFormats]) {
      return canvasFormats[format as keyof typeof canvasFormats];
    }

    // Handle custom pixel format (e.g., "1920x1080px")
    if (format.includes('px')) {
      const [width, height] = format.replace('px', '').split('x').map(Number);
      return { width: width || 1200, height: height || 675 };
    }

    // Handle custom cm format with DPI (e.g., "21x29cm@300dpi")
    if (format.includes('cm')) {
      const [dimensions, dpiPart] = format.split('@');
      const [widthCm, heightCm] = dimensions.replace('cm', '').split('x').map(Number);
      const dpi = dpiPart ? parseInt(dpiPart.replace('dpi', '')) : 300;
      
      // Convert cm to pixels: 1 inch = 2.54 cm, so pixels = (cm / 2.54) * dpi
      const width = Math.round((widthCm / 2.54) * dpi);
      const height = Math.round((heightCm / 2.54) * dpi);
      
      return { width: width || 1200, height: height || 675 };
    }

    // Fallback to default 16:9
    return { width: 1200, height: 675 };
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear main canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Composite all visible layers
    layers
      .filter(layer => layer.visible)
      .forEach(layer => {
        const layerCanvas = layerCanvasRefs.current.get(layer.id);
        if (layerCanvas) {
          ctx.save();
          ctx.globalAlpha = layer.opacity / 100;
          ctx.drawImage(layerCanvas, 0, 0);
          ctx.restore();
        }
      });
  }, [layers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const format = getCanvasSize(canvasFormat);
    canvas.width = format.width;
    canvas.height = format.height;
    
    // Initialize layer canvases
    layers.forEach(layer => {
      if (!layerCanvasRefs.current.has(layer.id)) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = format.width;
        layerCanvas.height = format.height;
        layerCanvasRefs.current.set(layer.id, layerCanvas);
      }
    });

    redrawCanvas();
  }, [canvasFormat, layers, redrawCanvas]);

  // Load initial image data into active layer when provided
  useEffect(() => {
    if (!initialImageData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getCanvasSize(canvasFormat);
    const targetLayerId = activeLayer ?? 0;
    let layerCanvas = layerCanvasRefs.current.get(targetLayerId);
    if (!layerCanvas) {
      layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;
      layerCanvasRefs.current.set(targetLayerId, layerCanvas);
    }
    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, layerCanvas!.width, layerCanvas!.height);
      ctx.drawImage(img, 0, 0);
      redrawCanvas();
    };
    img.src = initialImageData;
  }, [initialImageData, activeLayer, canvasFormat, redrawCanvas]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return getMousePosFromCoords(clientX, clientY);
  }, [zoom, panOffset]);

  const getMousePosFromCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    return {
      x: (clientX - rect.left - panOffset.x) / zoom,
      y: (clientY - rect.top - panOffset.y) / zoom
    };
  }, [zoom, panOffset]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Handle touch events
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const button = 'button' in e ? e.button : 0;
    const ctrlKey = 'ctrlKey' in e ? e.ctrlKey : false;

    if (button === 1 || ctrlKey) { // Middle mouse or Ctrl+click for panning
      setIsPanning(true);
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    const pos = getMousePosFromCoords(clientX, clientY);
    setLastDrawPoint(pos);
    setIsDrawing(true);
    
    // Start drawing on the active layer
    const layerCanvas = layerCanvasRefs.current.get(activeLayer);
    if (layerCanvas) {
      const ctx = layerCanvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }
  }, [activeLayer, getMousePosFromCoords]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isPanning) {
      const deltaX = clientX - lastPanPoint.x;
      const deltaY = clientY - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX * 1.5,
        y: prev.y + deltaY * 1.5
      }));
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    if (!isDrawing) return;

    // Obtenir le calque actif
    const activeLayerData = layers.find(layer => layer.id === activeLayer);
    if (!activeLayerData || !activeLayerData.visible) return;

    const layerCanvas = layerCanvasRefs.current.get(activeLayer);
    if (!layerCanvas) return;

    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePosFromCoords(clientX, clientY);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brushOpacity / 100;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }

    // Smooth line drawing
    const midX = (lastDrawPoint.x + pos.x) / 2;
    const midY = (lastDrawPoint.y + pos.y) / 2;
    
    ctx.quadraticCurveTo(lastDrawPoint.x, lastDrawPoint.y, midX, midY);
    ctx.stroke();
    
    setLastDrawPoint(pos);
    
    // Update main canvas
    redrawCanvas();
  }, [isDrawing, isPanning, currentColor, brushSize, brushOpacity, tool, lastPanPoint, activeLayer, layers, lastDrawPoint, redrawCanvas, getMousePosFromCoords]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setIsPanning(false);
    
    // Reset layer canvas state
    const layerCanvas = layerCanvasRefs.current.get(activeLayer);
    if (layerCanvas) {
      const ctx = layerCanvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.globalAlpha = 1;
      }
    }

    // Notify parent (autosave)
    onChange?.();
  }, [activeLayer, onChange]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(5, newZoom));
    });
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const clearCanvas = () => {
    // Clear all layer canvases
    layerCanvasRefs.current.forEach((layerCanvas) => {
      const ctx = layerCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
      }
    });
    
    // Redraw main canvas
    redrawCanvas();
  };

  const exportImage = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `sketch.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Connected Users Panel */}
      {connectedUsers.length > 0 && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs connectés ({connectedUsers.length})
            </h3>
          </div>
          <div className="space-y-2">
            {connectedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: `hsl(${user.id.length * 137.5 % 360}, 70%, 50%)` }}
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant={user.role === 'editor' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                {isHost && user.id !== 'host' && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUserRoleChange(user.id, user.role === 'editor' ? 'observer' : 'editor')}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUserKick(user.id)}
                    >
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Canvas Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary">🎨 Toile créative</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Badge variant="outline">{Math.round(zoom * 100)}%</Badge>
            <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={clearCanvas}>
              🗑️
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportImage('png')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Container */}
        <div 
          className="canvas-container relative overflow-hidden border-2 border-primary/30 rounded-lg bg-background shadow-glow touch-none"
          style={{ height: '700px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair shadow-elegant transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: '0 0',
              imageRendering: 'pixelated'
            }}
          />
          
          {/* User Cursors - Visible uniquement pour les autres utilisateurs */}
          {connectedUsers.filter(user => user.id !== 'host').map((user) => (
            <div
              key={`cursor-${user.id}`}
              className="absolute w-4 h-4 pointer-events-none transition-all duration-75 z-20"
              style={{
                left: user.cursor.x * zoom + panOffset.x,
                top: user.cursor.y * zoom + panOffset.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="w-full h-full rounded-full border-2 border-white shadow-glow animate-pulse"
                style={{ backgroundColor: `hsl(${user.id.length * 137.5 % 360}, 70%, 50%)` }}
              />
              <div className="absolute top-4 left-4 bg-card border border-border text-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-sm">
                {user.name}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-accent text-center">
          Ctrl+clic ou clic molette pour déplacer • Molette pour zoomer • Pinch sur tablette
        </div>
      </Card>
    </div>
  );
};