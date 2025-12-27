import { Button } from '@/components/ui/button';

export const LetterKeyboard = ({ onLetterClick, usedLetters }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const rows = [
    alphabet.slice(0, 9),
    alphabet.slice(9, 18),
    alphabet.slice(18, 26)
  ];

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2 flex-wrap">
          {row.map((letter) => {
            const isUsed = usedLetters.includes(letter);
            
            return (
              <Button
                key={letter}
                onClick={() => onLetterClick(letter)}
                disabled={isUsed}
                className={`font-game text-lg sm:text-xl w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 ${
                  isUsed
                    ? 'opacity-30 cursor-not-allowed bg-muted hover:bg-muted'
                    : 'bg-card hover:bg-primary hover:text-white hover:scale-110 hover:shadow-lg border-2 border-border hover:border-primary'
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
