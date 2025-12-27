import { Heart } from 'lucide-react';

export const LivesDisplay = ({ lives, shake }) => {
  return (
    <div className={`flex items-center gap-2 ${shake ? 'animate-shake' : ''}`}>
      <span className="font-game text-lg font-semibold mr-1">Lives:</span>
      <div className="flex gap-1">
        {[...Array(3)].map((_, index) => (
          <Heart
            key={index}
            className={`w-7 h-7 transition-all duration-300 ${
              index < lives
                ? 'fill-destructive text-destructive scale-100'
                : 'fill-muted text-muted scale-90 opacity-30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LivesDisplay;
