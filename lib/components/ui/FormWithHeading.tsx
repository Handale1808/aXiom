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

interface ButtonConfig {
  id: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

interface TabContent {
  fields?: Field[];
  buttons?: ButtonConfig[];
  customContent?: React.ReactNode;
}

interface TabWithContent {
  id: string;
  label: string;
  content: TabContent;
}

interface FormWithHeadingProps {
  tabs?: Tab[] | TabWithContent[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  fields?: Field[];
  submitButton?: {
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
  const isLegacyMode = fields !== undefined && submitButton !== undefined;

  const activeTabContent =
    !isLegacyMode && tabs
      ? (tabs as TabWithContent[]).find((tab) => tab.id === activeTab)?.content
      : undefined;

  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4 sm:p-5 md:p-6">
      <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      {tabs && tabs.length > 0 && (
        <div className="mb-4 sm:mb-6 flex overflow-x-auto border-b-2 border-[#30D6D6]/30 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#30D6D6]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex-shrink-0 px-3 sm:px-4 pb-2 sm:pb-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest transition-all ${
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
        {isLegacyMode && (
          <>
            {fields!.map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6]">
                  [{field.label}]
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border-2 border-[#006694]/50 bg-black/80 p-2.5 sm:p-3 text-sm sm:text-base text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6] min-h-[44px]"
                />
                {field.error && (
                  <div className="mt-2 text-[10px] sm:text-xs text-red-400 tracking-wider">
                    [{field.error}]
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={submitButton!.onClick}
              disabled={submitButton!.disabled}
              className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black py-3 sm:py-4 text-sm sm:text-base font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6] min-h-[44px]"
            >
              <span className="relative z-10">{submitButton!.text}</span>
            </button>

            {disclaimer && (
              <div className="relative border border-[#006694]/30 bg-black/30 p-2.5 sm:p-3 mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-cyan-100/50 leading-relaxed">
                  {disclaimer}
                </p>
              </div>
            )}
          </>
        )}

        {!isLegacyMode && activeTabContent && (
          <>
            {activeTabContent.fields?.map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6]">
                  [{field.label}]
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border-2 border-[#006694]/50 bg-black/80 p-2.5 sm:p-3 text-sm sm:text-base text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6] min-h-[44px]"
                />
                {field.error && (
                  <div className="mt-2 text-[10px] sm:text-xs text-red-400 tracking-wider">
                    [{field.error}]
                  </div>
                )}
              </div>
            ))}

            {activeTabContent.buttons &&
              activeTabContent.buttons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {activeTabContent.buttons.map((button) => (
                    <button
                      key={button.id}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black py-3 sm:py-4 text-sm sm:text-base font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6] min-h-[44px]"
                    >
                      <span className="relative z-10">{button.text}</span>
                    </button>
                  ))}
                </div>
              )}

            {activeTabContent.customContent && (
              <div>{activeTabContent.customContent}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export type { ButtonConfig, TabContent, TabWithContent };
