import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ToolsPanel } from '@/components/ToolsPanel';
import { Users, LogOut, Share2, FileImage } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [currentColor, setCurrentColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(15);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [canvasFormat, setCanvasFormat] = useState('16:9');
  const [drawings, setDrawings] = useState<any[]>([]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([
    { id: 0, name: 'Calque 1', opacity: 100, visible: true }
  ]);
  const [toolsPanelPosition, setToolsPanelPosition] = useState({ x: 20, y: 100 });
  const [connectedUsers, setConnectedUsers] = useState<Array<{ id: string; name: string; role: 'editor' | 'observer'; cursor: { x: number; y: number } }>>([
    { id: 'host', name: 'Vous (Hôte)', role: 'editor', cursor: { x: 0, y: 0 } }
  ]);
  const [isHost] = useState(true);
  
  // Autosave and current drawing tracking
  const [currentDrawingId, setCurrentDrawingId] = useState<number | null>(null);
  const [initialImageData, setInitialImageData] = useState<string | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = localStorage.getItem('currentUser') || 'user';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Load existing drawings for the current user
    const userDrawings = localStorage.getItem(`drawings_${currentUser}`);
    if (userDrawings) {
      setDrawings(JSON.parse(userDrawings));
    }
    
    // Check if opening an existing drawing
    const currentDrawingIdFromStorage = localStorage.getItem('currentDrawingId');
    if (currentDrawingIdFromStorage && userDrawings) {
      const drawings = JSON.parse(userDrawings);
      const existingDrawing = drawings.find((d: any) => d.id.toString() === currentDrawingIdFromStorage);
      if (existingDrawing) {
        // Load the existing drawing data
        setCanvasFormat(existingDrawing.size);
        localStorage.removeItem('currentDrawingId');
        
        // Préparer l'image initiale pour que le composant canvas la charge dans ses calques
        setCurrentDrawingId(existingDrawing.id);
        setInitialImageData(existingDrawing.data);
        return;
      }
    }
    
    // Load drawing configuration if creating a new drawing from gallery
    const newDrawingConfig = localStorage.getItem('newDrawingConfig');
    if (newDrawingConfig) {
      const config = JSON.parse(newDrawingConfig);
      setCanvasFormat(config.unit === 'cm' ? 
        `${config.width}x${config.height}cm@${config.dpi}dpi` : 
        `${config.width}x${config.height}px`);
      localStorage.removeItem('newDrawingConfig');
    }
  }, [isLoggedIn, navigate, currentUser]);

  const handleUserRoleChange = (userId: string, role: 'editor' | 'observer') => {
    setConnectedUsers(users => 
      users.map(user => 
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  const handleUserKick = (userId: string) => {
    setConnectedUsers(users => users.filter(user => user.id !== userId));
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const saveDrawing = (silent = false) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const baseData = {
      name: `Dessin ${new Date().toLocaleDateString('fr-FR')}`,
      thumbnail: canvas.toDataURL('image/jpeg', 0.3),
      data: canvas.toDataURL(),
      lastModified: new Date().toISOString(),
      size: canvasFormat,
      user: currentUser
    };
    
    let updatedDrawings: any[] = [];
    if (currentDrawingId) {
      updatedDrawings = drawings.map(d =>
        d.id === currentDrawingId ? { ...d, ...baseData, id: currentDrawingId } : d
      );
    } else {
      const newId = Date.now();
      const newDrawing = { ...baseData, id: newId };
      updatedDrawings = [...drawings, newDrawing];
      setCurrentDrawingId(newId);
    }

    setDrawings(updatedDrawings);
    localStorage.setItem(`drawings_${currentUser}`, JSON.stringify(updatedDrawings));
    if (!silent) alert('Dessin sauvegardé avec succès !');
  };

  const onCanvasChange = () => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      saveDrawing(true);
    }, 1500);
  };

  const inviteCollaborator = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'La Toile des Muses - Session créative collaborative',
        text: 'Rejoignez-moi pour créer ensemble sur La Toile des Muses !',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Lien copié dans le presse-papiers ! Partagez-le avec vos collaborateurs pour qu\'ils puissent rejoindre votre session créative.');
    }
  };

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 animate-fade-in">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                <Users className="h-4 w-4 mr-2" />
                Bibliothèque
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                🎨 La Toile des Muses
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Plateforme de création artistique collaborative
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => saveDrawing()} 
                variant="outline" 
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button 
                onClick={inviteCollaborator} 
                variant="outline" 
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 max-w-7xl mx-auto">
        {/* Draggable Tools Panel */}
        <ToolsPanel
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushOpacity={brushOpacity}
          setBrushOpacity={setBrushOpacity}
          tool={tool}
          setTool={setTool}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          layers={layers}
          setLayers={setLayers}
          position={toolsPanelPosition}
          onPositionChange={setToolsPanelPosition}
        />

        {/* Drawing Canvas */}
        <div className="ml-4">
          <DrawingCanvas
            currentColor={currentColor}
            brushSize={brushSize}
            brushOpacity={brushOpacity}
            tool={tool}
            canvasFormat={canvasFormat}
            activeLayer={activeLayer}
            layers={layers}
            connectedUsers={connectedUsers}
            isHost={isHost}
            onUserRoleChange={handleUserRoleChange}
            onUserKick={handleUserKick}
            initialImageData={initialImageData || undefined}
            onChange={onCanvasChange}
          />
        </div>

        {/* Info Card for Collaboration */}
        <div className="mt-6 p-4 bg-card border border-border rounded-lg shadow-elegant">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Collaboration créative</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Partagez votre lien pour inviter d'autres artistes à collaborer sur votre toile. 
                Chaque participant pourra voir les curseurs et modifications des autres en temps réel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;