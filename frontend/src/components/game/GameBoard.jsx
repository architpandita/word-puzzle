import { Card } from '@/components/ui/card';

export const GameBoard = ({ userAnswer, shake }) => {
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
    <div className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
      {userAnswer.map((word, wordIndex) => (
        <div key={wordIndex} className="flex flex-wrap items-center justify-center gap-2">
          {word.map((letterObj, letterIndex) => {
            const position = letterPositions[letterObj.char];
            
            return (
              <div
                key={`${wordIndex}-${letterIndex}`}
                className="relative"
              >
                {/* Letter tile */}
                <Card
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center border-2 transition-all duration-300 ${
                    letterObj.revealed
                      ? 'bg-primary/10 border-primary shadow-lg scale-105'
                      : 'bg-muted/30 border-border hover:border-primary/50'
                  }`}
                >
                  <span className={`font-game text-2xl sm:text-3xl md:text-4xl font-bold ${
                    letterObj.revealed ? 'text-primary' : 'text-transparent'
                  }`}>
                    {letterObj.char}
                  </span>
                </Card>
                
                {/* Position number badge */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  letterObj.revealed
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {position}
                </div>
              </div>
            );
          })}
          
          {/* Word separator */}
          {wordIndex < userAnswer.length - 1 && (
            <div className="w-3 h-1 bg-muted rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
