'use client';

import { useState } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const NUMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function ContadorGoles({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function select(n: number) {
    onChange(n);
    setOpen(false);
  }

  return (
    <div className="relative">
      {/* Campo que muestra el valor */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-12 h-10 rounded-xl bg-white/10 border border-white/20 text-white font-black text-xl text-center hover:bg-white/20 active:bg-white/30 transition-colors"
      >
        {value}
      </button>

      {/* Picker numérico */}
      {open && (
        <>
          {/* Overlay para cerrar al tocar fuera */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute z-50 bottom-12 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/20 rounded-2xl p-3 shadow-2xl">
            <div className="grid grid-cols-5 gap-2">
              {NUMS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => select(n)}
                  className={`w-11 h-11 rounded-xl font-black text-lg transition-all ${
                    value === n
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
