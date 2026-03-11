import { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  totalSeconds: number;
  onExpire?: () => void;
}

export default function CountdownTimer({ totalSeconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        onExpire?.();
        return 0;
      }
      return prev - 1;
    });
  }, [onExpire]);

  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, remaining]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const isWarning = remaining <= 600; // 10분 이하
  const isDanger = remaining <= 180; // 3분 이하

  return (
    <div
      className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border-2 ${
        isDanger
          ? 'bg-red-50 border-red-400 text-red-600 animate-pulse'
          : isWarning
            ? 'bg-amber-50 border-amber-400 text-amber-700'
            : 'bg-slate-50 border-slate-300 text-slate-700'
      }`}
    >
      <Clock className="w-5 h-5" />
      <span>
        {h > 0 && `${String(h).padStart(2, '0')}:`}
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}
