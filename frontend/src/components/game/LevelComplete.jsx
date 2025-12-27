import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, ArrowRight, Home } from 'lucide-react';

export const LevelComplete = ({ level, onNext, isLastLevel }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-2 animate-bounce-in">
        {/* Trophy animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
            <Trophy className="w-24 h-24 text-success relative z-10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-game text-4xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
            {isLastLevel ? '🎉 All Complete!' : 'Level Complete!'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isLastLevel 
              ? 'Congratulations! You\'ve completed all levels!'
              : `You've completed level ${level}! Ready for the next challenge?`
            }
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-8 h-8 text-warning animate-bounce-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Button */}
        <Button
          size="lg"
          onClick={onNext}
          className="w-full font-game text-xl py-6 rounded-full bg-gradient-to-r from-success to-primary hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          {isLastLevel ? (
            <>
              <Home className="w-5 h-5 mr-2" />
              Back Home
            </>
          ) : (
            <>
              Next Level
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default LevelComplete;
