import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import GameBoard from '@/components/game/GameBoard';
import LetterKeyboard from '@/components/game/LetterKeyboard';
import LivesDisplay from '@/components/game/LivesDisplay';
import LevelComplete from '@/components/game/LevelComplete';
import GameOver from '@/components/game/GameOver';
import ThemeToggle from '@/components/ThemeToggle';
import { gameData } from '@/data/gameData';
import { Home, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCompletedSentences, 
  addCompletedSentence, 
  saveGameState, 
  getGameState,
  clearGameState 
} from '@/utils/gameStorage';

export const GamePage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [userAnswer, setUserAnswer] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [shake, setShake] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [categories, setCategories] = useState([]);

  // Initialize game - load sentences and check for saved state
  useEffect(() => {
    const categoryIds = category.split(',');
    setCategories(categoryIds);

    // Gather all sentences from selected categories
    let allSentences = [];
    categoryIds.forEach(catId => {
      if (gameData[catId]) {
        allSentences = [...allSentences, ...gameData[catId]];
      }
    });

    // Filter out completed sentences
    const completedSentences = getCompletedSentences();
    const availableSentences = allSentences.filter(
      item => !completedSentences.includes(item.sentence)
    );

    // Shuffle sentences when multiple categories
    if (categoryIds.length > 1) {
      availableSentences.sort(() => Math.random() - 0.5);
    }

    setSentences(availableSentences);

    // Check for saved game state
    const savedState = getGameState();
    if (savedState && savedState.categories === category) {
      // Resume saved game
      setCurrentLevel(savedState.currentLevel || 0);
      setLives(savedState.lives || 3);
      toast.info('Game Resumed', {
        description: 'Continuing from where you left off',
        duration: 2000,
      });
    }
  }, [category]);

  const currentSentence = sentences[currentLevel];

  // Initialize user answer when level changes
  useEffect(() => {
    if (currentSentence) {
      const words = currentSentence.sentence.split(' ');
      const initialAnswer = words.map(word => {
        const letters = word.split('').map((char, idx) => {
          if (char === ' ') return { char: ' ', revealed: true, position: -1 };
          // Pre-fill 3-4 letters randomly (25% chance)
          const shouldReveal = Math.random() < 0.25 && idx < word.length;
          return {
            char: char.toUpperCase(),
            revealed: shouldReveal,
            position: -1
          };
        });
        return letters;
      });
      setUserAnswer(initialAnswer);
      setUsedLetters([]);
      setHintUsed(false);
    }
  }, [currentLevel, currentSentence]);

  // Save game state whenever it changes
  useEffect(() => {
    if (currentSentence && lives > 0 && !showLevelComplete && !showGameOver) {
      saveGameState({
        categories: category,
        currentLevel,
        lives,
        timestamp: Date.now()
      });
    }
  }, [currentLevel, lives, category, currentSentence, showLevelComplete, showGameOver]);

  const handleLetterClick = (letter) => {
    if (usedLetters.includes(letter)) return;

    const correctAnswer = currentSentence.sentence.toUpperCase();
    const isCorrect = correctAnswer.includes(letter);

    if (isCorrect) {
      // Update all positions where this letter appears
      const updatedAnswer = userAnswer.map(word => 
        word.map(letterObj => {
          if (letterObj.char === letter && !letterObj.revealed) {
            return { ...letterObj, revealed: true };
          }
          return letterObj;
        })
      );
      setUserAnswer(updatedAnswer);
      setUsedLetters([...usedLetters, letter]);
      
      toast.success('Correct!', {
        description: `${letter} is in the sentence`,
        duration: 2000,
      });

      // Check if puzzle is complete
      const isComplete = updatedAnswer.every(word => 
        word.every(letterObj => letterObj.revealed)
      );
      
      if (isComplete) {
        // Mark sentence as completed
        addCompletedSentence(currentSentence.sentence);
        
        setTimeout(() => {
          setShowLevelComplete(true);
        }, 500);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setUsedLetters([...usedLetters, letter]);
      
      // Shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      toast.error('Wrong!', {
        description: `${letter} is not in the sentence. Lives left: ${newLives}`,
        duration: 2000,
      });

      if (newLives === 0) {
        // IMPORTANT: Mark sentence as completed even on failure
        // This prevents the same sentence from appearing again
        addCompletedSentence(currentSentence.sentence);
        
        setTimeout(() => {
          setShowGameOver(true);
        }, 1000);
      }
    }
  };

  const handleHint = () => {
    if (hintUsed) return;

    // Find first unrevealed letter
    let hintGiven = false;
    const updatedAnswer = userAnswer.map(word => {
      if (hintGiven) return word;
      return word.map(letterObj => {
        if (!letterObj.revealed && !hintGiven) {
          hintGiven = true;
          if (!usedLetters.includes(letterObj.char)) {
            setUsedLetters([...usedLetters, letterObj.char]);
          }
          return { ...letterObj, revealed: true };
        }
        return letterObj;
      });
    });

    if (hintGiven) {
      setUserAnswer(updatedAnswer);
      setHintUsed(true);
      toast.info('Hint Used!', {
        description: 'A letter has been revealed',
        duration: 2000,
      });
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < sentences.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setLives(3); // Reset lives for new level
      setShowLevelComplete(false);
    } else {
      // All levels completed
      clearGameState();
      toast.success('🎉 Congratulations!', {
        description: 'You completed all available levels!',
        duration: 3000,
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const handleRetry = () => {
    // Move to next level instead of restarting
    if (currentLevel < sentences.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setLives(3);
      setShowGameOver(false);
    } else {
      // No more levels, go home
      clearGameState();
      navigate('/');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  if (!currentSentence) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="p-8 text-center space-y-4">
          <h2 className="font-game text-2xl font-bold text-foreground">🎉 All Levels Complete!</h2>
          <p className="text-muted-foreground">You've completed all sentences in the selected categories.</p>
          <Button onClick={handleHome} className="font-game">Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="outline"
            size="lg"
            onClick={handleHome}
            className="gap-2 rounded-full"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
          
          <div className="text-center">
            <h2 className="font-game text-2xl sm:text-3xl font-bold capitalize text-foreground">
              {categories.length > 1 ? 'Mixed Categories' : category}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Level {currentLevel + 1} of {sentences.length}
            </p>
          </div>

          <LivesDisplay lives={lives} shake={shake} />
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in">
          <Progress 
            value={(currentLevel / sentences.length) * 100} 
            className="h-3"
          />
        </div>

        {/* Category Badge */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border-2 border-secondary/40">
            <span className="text-sm font-medium text-secondary-foreground">
              {currentSentence.category}
            </span>
          </div>
        </div>

        {/* Game Board */}
        <Card className="mb-8 shadow-xl border-2 animate-fade-in">
          <div className="p-6 sm:p-8">
            <GameBoard userAnswer={userAnswer} shake={shake} />
          </div>
        </Card>

        {/* Hint Button */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <Button
            variant="outline"
            size="lg"
            onClick={handleHint}
            disabled={hintUsed}
            className="gap-2 rounded-full bg-info/10 border-info/30 hover:bg-info/20 disabled:opacity-50"
          >
            <Lightbulb className="w-5 h-5" />
            {hintUsed ? 'Hint Used' : 'Get Hint'}
          </Button>
        </div>

        {/* Letter Keyboard */}
        <div className="animate-fade-in">
          <LetterKeyboard 
            onLetterClick={handleLetterClick}
            usedLetters={usedLetters}
          />
        </div>
      </div>

      {/* Modals */}
      {showLevelComplete && (
        <LevelComplete
          level={currentLevel + 1}
          onNext={handleNextLevel}
          isLastLevel={currentLevel === sentences.length - 1}
        />
      )}

      {showGameOver && (
        <GameOver
          correctAnswer={currentSentence.sentence}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}
    </div>
  );
};

export default GamePage;
