import { Button } from '@/components/ui/button';

export const LetterKeyboard = ({ onLetterClick, usedLetters }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const rows = [
    alphabet.slice(0, 9),
    alphabet.slice(9, 18),
    alphabet.slice(18, 26)
  ];

  return (
    <div className="space-y-2 max-w-4xl mx-auto">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
          {row.map((letter) => {
            const isUsed = usedLetters.includes(letter);
            
            return (
              <Button
                key={letter}
                onClick={() => onLetterClick(letter)}
                disabled={isUsed}
                className={`font-game text-base sm:text-lg w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg transition-all duration-200 ${
                  isUsed
                    ? 'opacity-30 cursor-not-allowed bg-muted hover:bg-muted'
                    : 'bg-card hover:bg-primary hover:text-white hover:scale-110 hover:shadow-md border-2 border-border hover:border-primary active:scale-95'
                }`}
                variant="outline"
              >
                {letter}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LetterKeyboard;
