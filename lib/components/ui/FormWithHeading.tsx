import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";

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
  const scaled = useResponsiveScaling();
  return (
    <div
      className="relative border-2 border-[#30D6D6]/30 bg-black/50"
      style={{ padding: `${scaled.padding.containerMedium}px` }}
    >
      <div
        className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
        style={{
          height: `${scaled.decorations.cornerSize}px`,
          width: `${scaled.decorations.cornerSize}px`,
        }}
      />
      <div
        className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
        style={{
          height: `${scaled.decorations.cornerSize}px`,
          width: `${scaled.decorations.cornerSize}px`,
        }}
      />
      <div
        className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
        style={{
          height: `${scaled.decorations.cornerSize}px`,
          width: `${scaled.decorations.cornerSize}px`,
        }}
      />
      <div
        className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
        style={{
          height: `${scaled.decorations.cornerSize}px`,
          width: `${scaled.decorations.cornerSize}px`,
        }}
      />

      {tabs && tabs.length > 0 && (
        <div
          className="flex overflow-x-auto border-b-2 border-[#30D6D6]/30 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#30D6D6]/50"
          style={{ marginBottom: `${scaled.spacing.marginMedium}px` }}
        >
          {" "}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex-shrink-0 font-bold tracking-widest transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-[#30D6D6] text-[#30D6D6]"
                  : "text-[#006694] hover:text-[#30D6D6]/70"
              }`}
              style={{
                paddingLeft: `${scaled.padding.small}px`,
                paddingRight: `${scaled.padding.small}px`,
                paddingBottom: `${scaled.padding.small}px`,
                fontSize: `${scaled.text.tab}px`,
              }}
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
                <label
                  className="mb-2 block font-bold tracking-widest text-[#30D6D6]"
                  style={{ fontSize: `${scaled.text.extraSmall}px` }}
                >
                  [{field.label}]
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border-2 border-[#006694]/50 bg-black/80 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                  style={{
                    padding: `${scaled.padding.inputSmall}px`,
                    fontSize: `${scaled.text.base}px`,
                    minHeight: `${scaled.interactive.minTouchTarget}px`,
                  }}
                />
                {field.error && (
                  <div
                    className="mt-2 text-red-400 tracking-wider"
                    style={{ fontSize: `${scaled.text.extraSmall}px` }}
                  >
                    [{field.error}]
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={submitButton!.onClick}
              disabled={submitButton!.disabled}
              className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
              style={{
                paddingTop: `${scaled.button.paddingY}px`,
                paddingBottom: `${scaled.button.paddingY}px`,
                fontSize: `${scaled.text.base}px`,
                minHeight: `${scaled.interactive.minTouchTarget}px`,
              }}
            >
              <span className="relative z-10">{submitButton!.text}</span>
            </button>

            {disclaimer && (
              <div
                className="relative border border-[#006694]/30 bg-black/30"
                style={{
                  padding: `${scaled.padding.inputSmall}px`,
                  marginTop: `${scaled.spacing.marginTopSmall}px`,
                }}
              >
                <p
                  className="text-cyan-100/50 leading-relaxed"
                  style={{ fontSize: `${scaled.text.extraSmall}px` }}
                >
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
                  <div
                    className="mt-2 text-red-400 tracking-wider"
                    style={{ fontSize: `${scaled.text.extraSmall}px` }}
                  >
                    [{field.error}]
                  </div>
                )}
              </div>
            ))}

            {activeTabContent.buttons &&
              activeTabContent.buttons.length > 0 && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{
                    gap: `${scaled.spacing.gapMedium}px`,
                    marginTop: `${scaled.spacing.marginTopSmall}px`,
                  }}
                >
                  {activeTabContent.buttons.map((button) => (
                    <button
                      key={button.id}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
                      style={{
                        paddingTop: `${scaled.button.paddingY}px`,
                        paddingBottom: `${scaled.button.paddingY}px`,
                        fontSize: `${scaled.text.base}px`,
                        minHeight: `${scaled.interactive.minTouchTarget}px`,
                      }}
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
