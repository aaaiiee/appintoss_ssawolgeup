interface Props {
  elapsedSeconds: number;
}

export function TimerDisplay({ elapsedSeconds }: Props) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold text-white tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}
