import { Card } from '@/components/ui/card';

export const GameBoard = ({ userAnswer, shake, activePosition }) => {
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

  return (
    <div className={`space-y-4 ${shake ? 'animate-shake' : ''}`}>
      {userAnswer.map((word, wordIndex) => (
        <div key={wordIndex} className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {word.map((letterObj, letterIndex) => {
            const position = letterPositions[letterObj.char];
            const isActive = activePosition && 
                           activePosition.wordIdx === wordIndex && 
                           activePosition.letterIdx === letterIndex;
            
            return (
              <div
                key={`${wordIndex}-${letterIndex}`}
                className="relative"
              >
                {/* Letter tile */}
                <Card
                  className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-warning/20 border-warning shadow-lg scale-110 ring-2 ring-warning/50 animate-pulse'
                      : letterObj.revealed
                      ? 'bg-primary/10 border-primary shadow-md'
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <span className={`font-game text-xl sm:text-2xl md:text-3xl font-bold transition-colors ${
                    letterObj.revealed ? 'text-primary' : 'text-transparent'
                  }`}>
                    {letterObj.char}
                  </span>
                </Card>
                
                {/* Position number badge */}
                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  isActive
                    ? 'bg-warning text-warning-foreground scale-110'
                    : letterObj.revealed
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {position}
                </div>

                {/* Active indicator arrow */}
                {isActive && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-warning" />
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
