interface Tab {
  id: string;
  label: string;
}

interface Field {
  name: string;
  type: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

interface FormWithHeadingProps {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  fields: Field[];
  submitButton: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  };
  disclaimer?: string;
}

export default function FormWithHeading({
  tabs,
  activeTab,
  onTabChange,
  fields,
  submitButton,
  disclaimer,
}: FormWithHeadingProps) {
  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      {tabs && tabs.length > 0 && (
        <div className="mb-6 flex border-b-2 border-[#30D6D6]/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex-1 pb-3 text-sm font-bold tracking-widest transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-[#30D6D6] text-[#30D6D6]"
                  : "text-[#006694] hover:text-[#30D6D6]/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
              [{field.label}]
            </label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
            />
            {field.error && (
              <div className="mt-2 text-xs text-red-400 tracking-wider">
                [{field.error}]
              </div>
            )}
          </div>
        ))}

        <button
          onClick={submitButton.onClick}
          disabled={submitButton.disabled}
          className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
        >
          <span className="relative z-10">{submitButton.text}</span>
        </button>

        {disclaimer && (
          <div className="relative border border-[#006694]/30 bg-black/30 p-3 mt-4">
            <p className="text-xs text-cyan-100/50 leading-relaxed">
              {disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}