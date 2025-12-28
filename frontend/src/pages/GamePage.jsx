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
  getGameState
} from '@/utils/gameStorage';

export const GamePage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [userAnswer, setUserAnswer] = useState([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [shake, setShake] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null); // Track selected box

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
        const letters = word.split('').map((char) => {
          if (char === ' ') return { char: ' ', revealed: true };
          // Pre-fill 3-4 letters randomly (25% chance)
          const shouldReveal = Math.random() < 0.25;
          return {
            char: char.toUpperCase(),
            revealed: shouldReveal
          };
        });
        return letters;
      });
      setUserAnswer(initialAnswer);
      setHintUsed(false);
      setSelectedPosition(null);
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

  // Handle box click - select the box
  const handleBoxClick = (wordIdx, letterIdx) => {
    // Only allow selecting unrevealed boxes
    if (!userAnswer[wordIdx][letterIdx].revealed) {
      setSelectedPosition({ wordIdx, letterIdx });
      toast.info('Box Selected', {
        description: 'Now click a letter to fill this box',
        duration: 1500,
      });
    }
  };

  // Handle letter click - fill in selected box
  const handleLetterClick = (letter) => {
    if (!selectedPosition) {
      toast.error('No Box Selected', {
        description: 'Please click on an empty box first',
        duration: 2000,
      });
      return;
    }

    const { wordIdx, letterIdx } = selectedPosition;
    const correctLetter = userAnswer[wordIdx][letterIdx].char;

    if (letter === correctLetter) {
      // Correct letter!
      const updatedAnswer = userAnswer.map((word, wIdx) => 
        word.map((letterObj, lIdx) => {
          if (wIdx === wordIdx && lIdx === letterIdx) {
            return { ...letterObj, revealed: true };
          }
          return letterObj;
        })
      );
      setUserAnswer(updatedAnswer);
      setSelectedPosition(null);
      
      toast.success('Correct!', {
        description: `${letter} is the right letter for this position`,
        duration: 1500,
      });

      // Check if puzzle is complete
      const isComplete = updatedAnswer.every(word => 
        word.every(letterObj => letterObj.revealed)
      );
      
      if (isComplete) {
        addCompletedSentence(currentSentence.sentence);
        setTimeout(() => {
          setShowLevelComplete(true);
        }, 500);
      }
    } else {
      // Wrong letter!
      const newLives = lives - 1;
      setLives(newLives);
      setSelectedPosition(null);
      
      // Shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      toast.error('Wrong Letter!', {
        description: `${letter} is not correct for this position. Lives left: ${newLives}`,
        duration: 2000,
      });

      if (newLives === 0) {
        setTimeout(() => {
          setShowGameOver(true);
        }, 1000);
      }
    }
  };

  const handleHint = () => {
    if (hintUsed) return;

    // Find first unrevealed letter and reveal it
    let hintGiven = false;
    const updatedAnswer = userAnswer.map(word => {
      if (hintGiven) return word;
      return word.map(letterObj => {
        if (!letterObj.revealed && !hintGiven) {
          hintGiven = true;
          return { ...letterObj, revealed: true };
        }
        return letterObj;
      });
    });

    if (hintGiven) {
      setUserAnswer(updatedAnswer);
      setHintUsed(true);
      setSelectedPosition(null);
      toast.info('Hint Used!', {
        description: 'A letter has been revealed',
        duration: 2000,
      });
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < sentences.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setLives(3);
      setShowLevelComplete(false);
    } else {
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
    setLives(3);
    setShowGameOver(false);
    
    const words = currentSentence.sentence.split(' ');
    const initialAnswer = words.map(word => {
      const letters = word.split('').map((char) => {
        if (char === ' ') return { char: ' ', revealed: true };
        const shouldReveal = Math.random() < 0.25;
        return {
          char: char.toUpperCase(),
          revealed: shouldReveal
        };
      });
      return letters;
    });
    setUserAnswer(initialAnswer);
    setHintUsed(false);
    setSelectedPosition(null);
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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>

      {/* Compact Header - Fixed */}
      <div className="flex-none px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h2 className="font-game text-lg sm:text-xl font-bold capitalize text-foreground">
              {categories.length > 1 ? 'Mixed' : category}
            </h2>
            <p className="text-xs text-muted-foreground">
              Level {currentLevel + 1}/{sentences.length}
            </p>
          </div>

          <LivesDisplay lives={lives} shake={shake} />
        </div>

        <div className="mt-2">
          <Progress 
            value={(currentLevel / sentences.length) * 100} 
            className="h-1.5"
          />
        </div>
      </div>

      {/* Scrollable Content Area - ONLY THIS SCROLLS */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Category Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40">
              <span className="text-xs font-medium text-secondary-foreground">
                {currentSentence.category}
              </span>
            </div>
          </div>

          {/* Instruction */}
          {!selectedPosition && (
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              👆 Click an empty box first, then click a letter
            </div>
          )}
          {selectedPosition && (
            <div className="text-center text-sm text-warning font-semibold animate-pulse">
              ✨ Box selected! Now click the correct letter
            </div>
          )}

          {/* Game Board */}
          <Card className="shadow-lg border-2">
            <div className="p-4 sm:p-6">
              <GameBoard 
                userAnswer={userAnswer} 
                shake={shake}
                selectedPosition={selectedPosition}
                onBoxClick={handleBoxClick}
              />
            </div>
          </Card>

          {/* Hint Button */}
          <div className="flex justify-center pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHint}
              disabled={hintUsed}
              className="gap-2 rounded-full bg-info/10 border-info/30 hover:bg-info/20 disabled:opacity-50"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm">{hintUsed ? 'Hint Used' : 'Get Hint'}</span>
            </Button>
          </div>

          {/* Extra spacing for comfortable scrolling */}
          <div className="h-32" />
        </div>
      </div>

      {/* Fixed Letter Keyboard at Bottom - ALWAYS VISIBLE */}
      <div className="flex-shrink-0 bg-background border-t-2 border-border shadow-2xl">
        <div className="px-2 py-3">
          <LetterKeyboard 
            onLetterClick={handleLetterClick}
            selectedPosition={selectedPosition}
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
