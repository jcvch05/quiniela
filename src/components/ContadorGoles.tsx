'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function ContadorGoles({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-black text-lg transition-colors flex items-center justify-center select-none">
        −
      </button>
      <span className="w-8 text-center font-black text-lg tabular-nums">{value}</span>
      <button type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-black text-lg transition-colors flex items-center justify-center select-none">
        +
      </button>
    </div>
  );
}
