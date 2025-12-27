import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import ThemeToggle from '@/components/ThemeToggle';
import { Lightbulb, Film, Heart, Sparkles, RotateCcw, Settings, Play, Trophy } from 'lucide-react';
import { getGameState, clearGameState, clearCompletedSentences, getCompletedSentences } from '@/utils/gameStorage';
import { gameData } from '@/data/gameData';
import { toast } from 'sonner';

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState(['proverbs', 'movies', 'motivation']); // Default all selected
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [stats, setStats] = useState({ currentLevel: 0, totalLevels: 0, completedCount: 0 });

  useEffect(() => {
    // Load saved game state
    const savedState = getGameState();
    setGameState(savedState);

    // Calculate stats
    const completedSentences = getCompletedSentences();
    let totalSentences = 0;
    Object.values(gameData).forEach(category => {
      totalSentences += category.length;
    });

    if (savedState) {
      setStats({
        currentLevel: savedState.currentLevel + 1,
        totalLevels: totalSentences,
        completedCount: completedSentences.length
      });
    } else {
      setStats({
        currentLevel: 0,
        totalLevels: totalSentences,
        completedCount: completedSentences.length
      });
    }
  }, []);

  const categories = [
    {
      id: 'proverbs',
      name: 'Proverbs',
      description: 'Timeless wisdom from around the world',
      icon: Lightbulb,
      gradient: 'from-[hsl(160,45%,55%)] to-[hsl(180,50%,60%)]'
    },
    {
      id: 'movies',
      name: 'Movie Dialogues',
      description: 'Iconic lines from your favorite films',
      icon: Film,
      gradient: 'from-[hsl(260,45%,75%)] to-[hsl(280,50%,70%)]'
    },
    {
      id: 'motivation',
      name: 'Motivational Quotes',
      description: 'Inspiring words to brighten your day',
      icon: Heart,
      gradient: 'from-[hsl(25,85%,70%)] to-[hsl(40,80%,65%)]'
    }
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) {
          toast.error('At least one category must be selected');
          return prev;
        }
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleStartGame = () => {
    if (selectedCategories.length > 0) {
      clearGameState();
      navigate(`/game/${selectedCategories.join(',')}`);
    }
  };

  const handleContinueGame = () => {
    if (gameState) {
      navigate(`/game/${gameState.categories}`);
    }
  };

  const handleResetProgress = () => {
    clearGameState();
    clearCompletedSentences();
    setGameState(null);
    setStats(prev => ({ ...prev, currentLevel: 0, completedCount: 0 }));
    toast.success('Progress Reset', {
      description: 'All game progress has been cleared',
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Settings Button - Top Left */}
      <div className="fixed top-4 left-4 z-50 animate-fade-in">
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2 rounded-full">
              <Settings className="w-5 h-5" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-game text-2xl">Game Settings</DialogTitle>
              <DialogDescription>
                Choose which categories you want to play. At least one must be selected.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                
                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      className="pointer-events-none"
                    />
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSettingsOpen(false)} className="font-game">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-3xl w-full space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-gentle" />
            <h1 className="font-game text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Complete the Sentence
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse-gentle" />
          </div>
          <p className="text-muted-foreground text-lg">
            Test your knowledge of proverbs, movie quotes, and motivational sayings!
          </p>
        </div>

        {/* Progress Stats Card */}
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 shadow-xl">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-game text-xl font-semibold text-foreground">Your Progress</h3>
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="text-3xl font-bold font-game text-primary">
                  {gameState ? stats.currentLevel : '-'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Current Level</div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="text-3xl font-bold font-game text-success">
                  {stats.completedCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Completed</div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="text-3xl font-bold font-game text-secondary">
                  {stats.totalLevels}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Levels</div>
              </div>
            </div>

            {gameState && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round((stats.completedCount / stats.totalLevels) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.completedCount / stats.totalLevels) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {gameState ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleContinueGame}
                className="flex-1 font-game text-xl py-6 rounded-full bg-gradient-to-r from-success to-primary hover:shadow-xl hover:scale-105 transition-all duration-300 gap-2"
              >
                <Play className="w-5 h-5" />
                Continue Game
              </Button>
              <Button
                size="lg"
                onClick={handleStartGame}
                variant="outline"
                className="flex-1 font-game text-xl py-6 rounded-full gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Start New Game
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleStartGame}
              className="w-full font-game text-xl py-6 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          )}

          {gameState && (
            <Button
              size="lg"
              variant="ghost"
              onClick={handleResetProgress}
              className="w-full font-game gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Progress
            </Button>
          )}
        </div>

        {/* Categories Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Playing with {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
          </Badge>
        </div>

        {/* Instructions */}
        <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/50">
          <div className="p-6 space-y-3">
            <h3 className="font-game text-xl font-semibold text-center mb-4">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Guess letters</span> to complete the sentence
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                  2
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">3 lives per level</span> - Progress saves automatically
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  3
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Works offline</span> - Install as PWA for offline play
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CategorySelection;
