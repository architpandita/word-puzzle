import { Card } from '@/components/ui/card';

export const GameBoard = ({ userAnswer, shake, selectedPosition, onBoxClick }) => {
  // Create a map to track positions for each unique letter
  const getLetterPositions = () => {
    const positionMap = {};
    let position = 1;
    
    userAnswer.forEach(word => {
      word.forEach(letterObj => {
        const char = letterObj.char;
        if (char !== ' ' && !positionMap[char]) {
          positionMap[char] = position;
          position++;
        }
      });
    });
    
    return positionMap;
  };

  const letterPositions = getLetterPositions();

  const handleBoxClick = (wordIdx, letterIdx, letterObj) => {
    if (!letterObj.revealed) {
      console.log('Box clicked:', { wordIdx, letterIdx, char: letterObj.char });
      onBoxClick(wordIdx, letterIdx);
    }
  };

  return (
    <div className={`space-y-4 ${shake ? 'animate-shake' : ''}`}>
      {userAnswer.map((word, wordIndex) => (
        <div key={wordIndex} className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {word.map((letterObj, letterIndex) => {
            const position = letterPositions[letterObj.char];
            const isSelected = selectedPosition && 
                             selectedPosition.wordIdx === wordIndex && 
                             selectedPosition.letterIdx === letterIndex;
            
            return (
              <div
                key={`${wordIndex}-${letterIndex}`}
                className="relative"
              >
                {/* Letter tile - CLICKABLE */}
                <div
                  onClick={() => handleBoxClick(wordIndex, letterIndex, letterObj)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center border-2 rounded-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-warning/30 border-warning shadow-xl scale-110 ring-4 ring-warning/50 cursor-pointer'
                      : letterObj.revealed
                      ? 'bg-primary/10 border-primary shadow-md cursor-default'
                      : 'bg-muted/30 border-border/50 hover:border-warning/50 hover:scale-105 cursor-pointer hover:shadow-md'
                  }`}
                >
                  <span className={`font-game text-xl sm:text-2xl md:text-3xl font-bold transition-colors select-none ${
                    letterObj.revealed ? 'text-primary' : 'text-transparent'
                  }`}>
                    {letterObj.char}
                  </span>
                </div>
                
                {/* Position number badge */}
                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  isSelected
                    ? 'bg-warning text-warning-foreground scale-110 ring-2 ring-warning'
                    : letterObj.revealed
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {position}
                </div>

                {/* Selected indicator - pointing arrow and glow */}
                {isSelected && (
                  <>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <div className="flex flex-col items-center">
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-warning" />
                        <span className="text-xs font-bold text-warning mt-1">HERE</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-warning/20 rounded-lg animate-pulse" />
                  </>
                )}

                {/* Click hint for empty boxes */}
                {!letterObj.revealed && !isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground font-semibold">CLICK</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Word separator */}
          {wordIndex < userAnswer.length - 1 && (
            <div className="w-2 h-0.5 bg-muted rounded-full mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
