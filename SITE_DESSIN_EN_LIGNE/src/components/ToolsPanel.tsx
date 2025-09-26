import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GripVertical, Palette, Brush, Eraser, Eye, EyeOff, Plus, Trash, Settings, Layers, Paintbrush, Minus } from 'lucide-react';

interface ToolsPanelProps {
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
  activeLayer: number;
  setActiveLayer: (layer: number) => void;
  layers: Array<{ id: number; name: string; opacity: number; visible: boolean }>;
  setLayers: (layers: Array<{ id: number; name: string; opacity: number; visible: boolean }>) => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

export const ToolsPanel = ({
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  tool,
  setTool,
  activeLayer,
  setActiveLayer,
  layers,
  setLayers,
  position,
  onPositionChange
}: ToolsPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Raccourcis personnalisables
  const [quickPresets, setQuickPresets] = useState([
    { id: 1, name: "Noir fin", color: "#000000", size: 5, tool: "brush" as const },
    { id: 2, name: "Rouge épais", color: "#FF0000", size: 25, tool: "brush" as const },
    { id: 3, name: "Gomme", color: "#000000", size: 20, tool: "eraser" as const },
  ]);

  const extendedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FF69B4', '#90EE90', '#87CEEB', '#DDA0DD', '#F0E68C',
    '#FF6347', '#40E0D0', '#EE82EE', '#98FB98', '#F5DEB3',
    '#CD853F', '#DEB887', '#8FBC8F', '#6495ED', '#DC143C',
    '#B22222', '#228B22', '#4169E1', '#FF4500', '#DA70D6'
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    document.body.classList.add('dragging');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = Math.abs(e.clientX - (position.x + dragStart.x));
    const deltaY = Math.abs(e.clientY - (position.y + dragStart.y));
    
    // Considérer comme mouvement si on bouge de plus de 5px
    if (deltaX > 5 || deltaY > 5) {
      setHasMoved(true);
    }
    
    onPositionChange({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
    // Reset hasMoved après un délai pour éviter l'ouverture immédiate
    setTimeout(() => setHasMoved(false), 100);
  };

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Fermer le menu rapide en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showQuickMenu) {
        setShowQuickMenu(false);
      }
    };

    if (showQuickMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickMenu]);

  const addLayer = () => {
    const newLayer = {
      id: layers.length,
      name: `Calque ${layers.length + 1}`,
      opacity: 100,
      visible: true
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const deleteLayer = (layerId: number) => {
    if (layers.length <= 1) return; // Keep at least one layer
    const newLayers = layers.filter(layer => layer.id !== layerId);
    // Reindex layers to avoid gaps
    const reindexedLayers = newLayers.map((layer, index) => ({
      ...layer,
      id: index,
      name: `Calque ${index + 1}`
    }));
    setLayers(reindexedLayers);
    if (activeLayer === layerId) {
      setActiveLayer(reindexedLayers[0]?.id || 0);
    } else if (activeLayer > layerId) {
      setActiveLayer(activeLayer - 1);
    }
  };

  const toggleLayerVisibility = (layerId: number) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const updateLayerOpacity = (layerId: number, opacity: number) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  };

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setCurrentColor(preset.color);
    setBrushSize(preset.size);
    setTool(preset.tool);
    setShowQuickMenu(false);
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasMoved) return; // Si on vient de déplacer, ne rien faire
    
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (timeDiff < 300) { // Double-clic détecté (moins de 300ms entre les clics)
      setShowQuickMenu(true);
    } else { // Simple clic
      setIsMinimized(false);
    }
    
    setLastClickTime(now);
  };

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed z-50">
        {/* Bulle principale */}
        <div
          className="relative"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'all 0.3s ease-out'
          }}
          onMouseDown={handleMouseDown}
        >
          <Button
            onClick={handleBubbleClick}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary hover:to-primary/70 border-2 border-primary/30 shadow-elegant hover:shadow-glow backdrop-blur-sm relative overflow-hidden group pointer-events-auto"
            style={{
              transition: isDragging ? 'none' : 'all 0.3s ease-out',
              transform: isDragging ? 'scale(1.05)' : 'scale(1)'
            }}
            size="sm"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            
            {/* Icon with glow effect */}
            <Palette className="h-7 w-7 text-white drop-shadow-sm relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            
            {/* Subtle pulse animation */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          </Button>
        </div>

        {/* Menu rapide des raccourcis */}
        {showQuickMenu && (
          <div
            className="fixed animate-scale-in"
            style={{
              left: `${position.x + 80}px`,
              top: `${position.y}px`,
              zIndex: 60
            }}
          >
            <Card className="p-3 shadow-glow border border-primary/30 backdrop-blur-md bg-background/95 min-w-48">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-primary">Raccourcis</h4>
                <Button
                  onClick={() => setShowQuickMenu(false)}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-2">
                {quickPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-border" 
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-xs">{preset.name}</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {preset.size}px
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <div className="text-xs text-muted-foreground text-center">
                Double-clic pour ouvrir • Clic simple pour panneau complet
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="tools-panel fixed z-50 transition-all duration-500 ease-out animate-fade-in"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Card className="w-80 shadow-elegant border-2 border-primary/20 backdrop-blur-md bg-background/95 hover:shadow-glow transition-all duration-300 ease-out">
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-between p-4 border-b border-border cursor-grab active:cursor-grabbing bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 hover:from-primary/10 hover:via-primary/20 hover:to-primary/10 transition-all duration-300 rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-semibold flex items-center gap-2 text-primary">
            <GripVertical className="h-4 w-4 text-accent transition-transform duration-200 hover:scale-110" />
            🎨 Outils
          </h3>
          <Button
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/20 transition-all duration-200 hover:scale-110 rounded-full"
          >
            <Minus className="h-3 w-3 transition-transform duration-200 hover:rotate-90" />
          </Button>
        </div>
        
        <div className="p-4">
        <Accordion type="multiple" defaultValue={["format", "tools", "brush", "colors", "layers"]} className="space-y-2">

        {/* Tool Selection */}
        <AccordionItem value="tools" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              <span className="text-sm font-medium">Outils</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tool === 'brush' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('brush')}
                className="transition-all duration-200"
              >
                <Brush className="h-4 w-4 mr-2" />
                Pinceau
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
                className="transition-all duration-200"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Gomme
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brush Settings */}
        <AccordionItem value="brush" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Brush className="h-4 w-4" />
              <span className="text-sm font-medium">Paramètres du pinceau</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Taille: {brushSize}px
              </label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Opacité: {brushOpacity}%
              </label>
              <Slider
                value={[brushOpacity]}
                onValueChange={(value) => setBrushOpacity(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Extended Color Palette */}
        <AccordionItem value="colors" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="text-sm font-medium">Couleurs</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="grid grid-cols-6 gap-2 mb-3">
              {extendedColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    currentColor === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Layers */}
        <AccordionItem value="layers" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="text-sm font-medium">Calques</span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  addLayer();
                }}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {layers.map((layer) => (
                <div 
                  key={layer.id}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    activeLayer === layer.id ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      className="text-sm font-medium flex-1 text-left"
                      onClick={() => setActiveLayer(layer.id)}
                    >
                      {layer.name}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="h-6 w-6 p-0"
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      {layers.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLayer(layer.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Opacité</span>
                      <Badge variant="outline" className="text-xs">
                        {layer.opacity}%
                      </Badge>
                    </div>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        </Accordion>
        </div>
      </Card>
    </div>
  );
};