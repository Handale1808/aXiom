// lib/components/TextSubmit.tsx

import { useState } from "react";

interface TextSubmitProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function TextSubmit({
  onSubmit,
  placeholder = "Enter text...",
}: TextSubmitProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
