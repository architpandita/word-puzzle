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
  const [usedLetters, setUsedLetters] = useState([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [shake, setShake] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activePosition, setActivePosition] = useState(null); // Track active letter position

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
      
      // Set first unrevealed position as active
      findAndSetNextActivePosition(initialAnswer);
    }
  }, [currentLevel, currentSentence]);

  // Find next unrevealed position and set it as active
  const findAndSetNextActivePosition = (answer) => {
    for (let wordIdx = 0; wordIdx < answer.length; wordIdx++) {
      for (let letterIdx = 0; letterIdx < answer[wordIdx].length; letterIdx++) {
        if (!answer[wordIdx][letterIdx].revealed) {
          setActivePosition({ wordIdx, letterIdx });
          return;
        }
      }
    }
    setActivePosition(null); // All revealed
  };

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
      
      // Update active position
      findAndSetNextActivePosition(updatedAnswer);
      
      toast.success('Correct!', {
        description: `${letter} is in the sentence`,
        duration: 1500,
      });

      // Check if puzzle is complete
      const isComplete = updatedAnswer.every(word => 
        word.every(letterObj => letterObj.revealed)
      );
      
      if (isComplete) {
        // Mark sentence as completed ONLY on success
        addCompletedSentence(currentSentence.sentence);
        setActivePosition(null);
        
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
        duration: 1500,
      });

      if (newLives === 0) {
        // Do NOT mark as completed on failure
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
      findAndSetNextActivePosition(updatedAnswer);
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
    // Retry the same level with fresh lives
    setLives(3);
    setShowGameOver(false);
    
    // Reset the current level
    const words = currentSentence.sentence.split(' ');
    const initialAnswer = words.map(word => {
      const letters = word.split('').map((char, idx) => {
        if (char === ' ') return { char: ' ', revealed: true, position: -1 };
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
    findAndSetNextActivePosition(initialAnswer);
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-2 right-2 z-50">
        <ThemeToggle />
      </div>

      {/* Compact Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/50">
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

        {/* Compact Progress Bar */}
        <div className="mt-2">
          <Progress 
            value={(currentLevel / sentences.length) * 100} 
            className="h-1.5"
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Category Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40">
              <span className="text-xs font-medium text-secondary-foreground">
                {currentSentence.category}
              </span>
            </div>
          </div>

          {/* Game Board */}
          <Card className="shadow-lg border-2">
            <div className="p-4 sm:p-6">
              <GameBoard 
                userAnswer={userAnswer} 
                shake={shake}
                activePosition={activePosition}
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

          {/* Extra spacing for scrolling comfort */}
          <div className="h-8" />
        </div>
      </div>

      {/* Fixed Letter Keyboard at Bottom */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-t-2 border-border/50 shadow-lg">
        <div className="px-2 py-3">
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
