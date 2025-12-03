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
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
