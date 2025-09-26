import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, FileImage, Palette } from 'lucide-react';

const Gallery = () => {
  const navigate = useNavigate();
  const [newDrawingDialog, setNewDrawingDialog] = useState(false);
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [unit, setUnit] = useState('px');
  const [dpi, setDpi] = useState('300');
  const [userDrawings, setUserDrawings] = useState<any[]>([]);
  
  const currentUser = localStorage.getItem('currentUser') || 'user';

  useEffect(() => {
    // Load user's drawings
    const drawings = localStorage.getItem(`drawings_${currentUser}`);
    if (drawings) {
      setUserDrawings(JSON.parse(drawings));
    }
  }, [currentUser]);

  const presetSizes = {
    px: [
      { name: 'HD (1920x1080)', width: '1920', height: '1080' },
      { name: '4K (3840x2160)', width: '3840', height: '2160' },
      { name: 'Carré Instagram (1080x1080)', width: '1080', height: '1080' },
      { name: 'Format A4 (2480x3508)', width: '2480', height: '3508' },
    ],
    cm: [
      { name: 'A4 (21x29.7)', width: '21', height: '29.7' },
      { name: 'A3 (29.7x42)', width: '29.7', height: '42' },
      { name: 'Carré (20x20)', width: '20', height: '20' },
      { name: 'Paysage (30x20)', width: '30', height: '20' },
    ]
  };

  const handleCreateDrawing = () => {
    // Store drawing configuration and navigate to drawing page
    const drawingConfig = {
      width: parseFloat(width),
      height: parseFloat(height),
      unit,
      dpi: parseInt(dpi)
    };
    localStorage.setItem('newDrawingConfig', JSON.stringify(drawingConfig));
    navigate('/drawing');
  };

  const handleOpenDrawing = (drawingId: number) => {
    localStorage.setItem('currentDrawingId', drawingId.toString());
    navigate('/drawing');
  };

  const handlePresetSelect = (preset: any) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 animate-fade-in">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                🎨 La Toile des Muses - Bibliothèque
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 max-w-7xl mx-auto">
        {/* Action Bar */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Mes créations</h2>
            <p className="text-sm text-muted-foreground">Gérez vos dessins et créez de nouvelles œuvres</p>
          </div>
          
          <Dialog open={newDrawingDialog} onOpenChange={setNewDrawingDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau dessin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Créer un nouveau dessin
                </DialogTitle>
                <DialogDescription>
                  Configurez les dimensions et la résolution de votre toile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Unit Selection */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">Pixels (px)</SelectItem>
                      <SelectItem value="cm">Centimètres (cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preset Sizes */}
                <div className="space-y-2">
                  <Label>Tailles prédéfinies</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {presetSizes[unit as keyof typeof presetSizes].map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handlePresetSelect(preset)}
                        className="text-left justify-start"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Largeur ({unit})</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Hauteur ({unit})</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                {/* DPI for cm units */}
                {unit === 'cm' && (
                  <div className="space-y-2">
                    <Label htmlFor="dpi">Résolution (DPI/PPP)</Label>
                    <Select value={dpi} onValueChange={setDpi}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="72">72 DPI (Écran)</SelectItem>
                        <SelectItem value="150">150 DPI (Qualité)</SelectItem>
                        <SelectItem value="300">300 DPI (Impression)</SelectItem>
                        <SelectItem value="600">600 DPI (Haute qualité)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewDrawingDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateDrawing}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userDrawings.map((drawing) => (
            <Card key={drawing.id} className="group cursor-pointer hover:shadow-elegant transition-all duration-200 hover:scale-105">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                  <img
                    src={drawing.thumbnail || '/placeholder.svg'}
                    alt={drawing.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-sm font-medium text-foreground truncate">
                  {drawing.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {drawing.size} • Modifié le {new Date(drawing.lastModified).toLocaleDateString('fr-FR')}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => handleOpenDrawing(drawing.id)}
                  variant="outline"
                  size="sm"
                  className="w-full transition-all duration-200"
                >
                  <FileImage className="h-3 w-3 mr-2" />
                  Ouvrir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State (if no drawings) */}
        {userDrawings.length === 0 && (
          <div className="text-center py-12">
            <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun dessin pour le moment</h3>
            <p className="text-muted-foreground mb-6">Créez votre première œuvre pour commencer</p>
            <Button onClick={() => setNewDrawingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier dessin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;