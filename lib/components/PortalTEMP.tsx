import { createPortal } from "react-dom";
import { CatTraits } from "@/lib/types/cat-drawing";
import ProceduralCat from "./ProceduralCatTEMP";

interface PortalProps {
  isOpen: boolean;
  onClose: () => void;
  traits: CatTraits;
}

export default function Portal({ isOpen, onClose, traits }: PortalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-black p-8 relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold hover:opacity-70"
        >
          X
        </button>
        <div className="w-full h-80">
          <ProceduralCat traits={traits} />
        </div>
      </div>
    </div>,
    document.body
  );
}