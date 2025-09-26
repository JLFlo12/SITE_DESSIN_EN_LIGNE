import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      if ((username === 'user' && password === 'user') || (username === 'Florian' && password === 'florian')) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', username);
        navigate('/', { replace: true });
      } else {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-zoom-in">
        <CardHeader className="text-center space-y-4">
          <div className="animate-float">
            <CardTitle className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              🎨 La Toile des Muses
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            Plateforme de création artistique collaborative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-lg animate-fade-in">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;