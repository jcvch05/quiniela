'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function ContadorGoles({ value, onChange }: Props) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onFocus={e => e.target.select()}
      onChange={e => {
        const raw = e.target.value.replace(/^0+/, '') || '0';
        const n = parseInt(raw);
        if (!isNaN(n) && n >= 0 && n <= 20) onChange(n);
        else if (e.target.value === '') onChange(0);
      }}
      className="w-12 h-11 text-center bg-white/10 border border-white/20 rounded-xl text-white font-black text-xl focus:outline-none focus:border-yellow-400 focus:bg-white/20"
    />
  );
}
