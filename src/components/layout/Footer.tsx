import React from "react";

export default function Footer() {
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none z-[100]">
      <div className="bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-medium">
          made by <span className="text-zinc-300">FraisenSenpai</span> with <span className="text-red-500/80">❤️</span>
        </p>
      </div>
    </div>
  );
}
