// lib/components/TextSubmit.tsx

import { useState } from "react";

interface TextSubmitProps {
  onSubmit: (text: string, email?: string) => void;
  placeholder?: string;
}

export default function TextSubmit({
  onSubmit,
  placeholder = "Enter feedback...",
}: TextSubmitProps) {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text, email.trim() || undefined);
      setText("");
      setEmail("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6 backdrop-blur-sm font-mono">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <div className="mb-4">
        <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
          [FEEDBACK_INPUT]
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          className="w-full border-2 border-[#006694]/50 bg-black/80 p-4 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
          [EMAIL_OPTIONAL]
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@xenocorp.alien"
          className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-[#30D6D6] disabled:hover:shadow-none"
      >
        <span className="relative z-10">INITIATE_SCAN</span>
      </button>
    </div>
  );
}