import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { Lightbulb, Film, Heart, Sparkles, RotateCcw } from 'lucide-react';
import { getGameState, clearGameState, clearCompletedSentences } from '@/utils/gameStorage';
import { toast } from 'sonner';

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    // Check for saved game
    const savedState = getGameState();
    setHasSavedGame(!!savedState);
  }, []);

  const categories = [
    {
      id: 'proverbs',
      name: 'Proverbs',
      description: 'Timeless wisdom from around the world',
      icon: Lightbulb,
      color: 'primary',
      gradient: 'from-[hsl(160,45%,55%)] to-[hsl(180,50%,60%)]'
    },
    {
      id: 'movies',
      name: 'Movie Dialogues',
      description: 'Iconic lines from your favorite films',
      icon: Film,
      color: 'secondary',
      gradient: 'from-[hsl(260,45%,75%)] to-[hsl(280,50%,70%)]'
    },
    {
      id: 'motivation',
      name: 'Motivational Quotes',
      description: 'Inspiring words to brighten your day',
      icon: Heart,
      color: 'accent',
      gradient: 'from-[hsl(25,85%,70%)] to-[hsl(40,80%,65%)]'
    }
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleStartGame = () => {
    if (selectedCategories.length > 0) {
      // Clear any previous game state when starting fresh
      clearGameState();
      navigate(`/game/${selectedCategories.join(',')}`);
    }
  };

  const handleContinueGame = () => {
    const savedState = getGameState();
    if (savedState) {
      navigate(`/game/${savedState.categories}`);
    }
  };

  const handleResetProgress = () => {
    clearGameState();
    clearCompletedSentences();
    setHasSavedGame(false);
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

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-4xl w-full space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-gentle" />
            <h1 className="font-game text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Complete the Sentence
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse-gentle" />
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose one or more categories! Mix them up for a shuffled challenge.
          </p>
        </div>

        {/* Continue/Reset buttons */}
        {hasSavedGame && (
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={handleContinueGame}
              className="font-game rounded-full bg-gradient-to-r from-success to-primary hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Continue Game
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleResetProgress}
              className="font-game rounded-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Progress
            </Button>
          </div>
        )}

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <Card
                key={category.id}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden border-2 ${
                  isSelected 
                    ? 'border-primary shadow-xl scale-105 ring-4 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleCategoryToggle(category.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative p-6 space-y-4">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative space-y-2 text-center">
                    <h3 className="font-game text-2xl font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce-in">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected categories count */}
        {selectedCategories.length > 0 && (
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-base px-4 py-2">
              {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
            </Badge>
          </div>
        )}

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={selectedCategories.length === 0}
            className="font-game text-xl px-12 py-6 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Start New Game
          </Button>
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
                  <span className="font-medium text-foreground">Select categories</span> - Choose one or multiple for variety
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                  2
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">3 lives only</span> - Progress is saved automatically!
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
