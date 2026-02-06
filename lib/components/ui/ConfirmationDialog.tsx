import Modal from "./Modal";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  isLoading = false,
  variant = "danger",
}: ConfirmationDialogProps) {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const borderColor =
    variant === "danger" ? "border-red-500" : "border-yellow-500";
  const accentColor = variant === "danger" ? "text-red-400" : "text-yellow-400";
  const buttonColor =
    variant === "danger"
      ? "border-red-500 text-red-400 hover:bg-red-500"
      : "border-yellow-500 text-yellow-400 hover:bg-yellow-500";

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div
        className={`relative border-2 ${borderColor} bg-black p-4 sm:p-5 md:p-6`}
      >
        <div
          className={`absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 ${borderColor}`}
        />
        <div
          className={`absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 ${borderColor}`}
        />
        <div
          className={`absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 ${borderColor}`}
        />
        <div
          className={`absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 ${borderColor}`}
        />

        <div className="mb-3 sm:mb-4">
          <h2
            id="dialog-title"
            className={`text-xs sm:text-sm font-bold tracking-widest ${accentColor}`}
          >
            [{title}]
          </h2>
        </div>

        <p
          id="dialog-message"
          className="mb-4 sm:mb-6 text-sm sm:text-base text-cyan-100/90 leading-relaxed"
        >
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            disabled={isLoading}
            className="w-full sm:w-auto border border-[#006694] bg-black px-4 py-2 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold tracking-wider text-[#006694] transition-all hover:bg-[#006694] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isLoading}
            className={`w-full sm:w-auto border ${buttonColor} bg-black px-4 py-2 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold tracking-wider transition-all hover:text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]`}
          >
            {isLoading && <div className="h-3 w-3 animate-pulse bg-current" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
