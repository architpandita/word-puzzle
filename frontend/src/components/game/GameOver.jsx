import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Home, XCircle } from 'lucide-react';

export const GameOver = ({ correctAnswer, onRetry, onHome }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-2 border-destructive/20 animate-bounce-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
            <XCircle className="w-24 h-24 text-destructive relative z-10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-game text-4xl font-bold text-destructive">
            Game Over!
          </h2>
          <p className="text-muted-foreground text-lg">
            You've run out of lives. Better luck next time!
          </p>
        </div>

        {/* Correct Answer */}
        <div className="bg-muted/50 p-4 rounded-xl border-2 border-border">
          <p className="text-sm text-muted-foreground mb-2">The correct answer was:</p>
          <p className="font-game text-xl text-foreground font-semibold">
            {correctAnswer}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={onHome}
            className="flex-1 font-game text-lg py-6 rounded-full gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
          <Button
            size="lg"
            onClick={onRetry}
            className="flex-1 font-game text-lg py-6 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-105 transition-all duration-300 gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retry
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GameOver;
