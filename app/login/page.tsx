"use client";

import { useState } from "react";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "PASSWORD_MUST_BE_8+_CHARACTERS";
    }
    if (!/[A-Z]/.test(pass)) {
      return "PASSWORD_REQUIRES_UPPERCASE";
    }
    if (!/[a-z]/.test(pass)) {
      return "PASSWORD_REQUIRES_LOWERCASE";
    }
    if (!/[0-9]/.test(pass)) {
      return "PASSWORD_REQUIRES_NUMBER";
    }
    return null;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "INVALID_EMAIL_FORMAT";
    }

    if (mode === "signup") {
      if (!firstName.trim()) {
        newErrors.firstName = "FIRST_NAME_REQUIRED";
      }
      if (!lastName.trim()) {
        newErrors.lastName = "LAST_NAME_REQUIRED";
      }
      
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "PASSWORDS_DO_NOT_MATCH";
      }
    } else {
      if (!password) {
        newErrors.password = "PASSWORD_REQUIRED";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted:", { mode, email, password, firstName, lastName });
    }
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen bg-black p-4 font-mono">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <h1 className="text-center text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            AUTH
          </h1>
          <p className="mt-2 text-center text-sm tracking-widest text-[#006694] font-bold">
            [SECURE_ACCESS_PROTOCOL]
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [ABOUT_AXIOM]
            </h2>

            <div className="space-y-4 text-cyan-100/70 leading-relaxed">
              <p>
                Welcome to aXiom Feline Genetics Laboratory, where cutting-edge
                xenobiology meets adorable companionship. We specialize in the
                revolutionary science of splicing extraterrestrial DNA with
                domestic felines to create the most extraordinary pets in the
                galaxy.
              </p>

              <p>
                Through our secure platform, you can browse and purchase your
                very own genetically-enhanced specimen. Each cat comes with
                unique alien traits, enhanced abilities, and questionable
                physics-defying properties that will transform your home into
                an intergalactic adventure.
              </p>

              <div className="relative border-2 border-[#30D6D6]/30 bg-[#30D6D6]/5 p-4 mt-6">
                <h3 className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
                  [PLATFORM_FEATURES]
                </h3>
                <ul className="space-y-2 text-sm text-cyan-100/60">
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D6D6] mt-1">▸</span>
                    <span>Browse enhanced feline specimens by genetic tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D6D6] mt-1">▸</span>
                    <span>Submit feedback on your specimen's anomalies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D6D6] mt-1">▸</span>
                    <span>Track genetic stability and mutation progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D6D6] mt-1">▸</span>
                    <span>Access emergency containment protocols</span>
                  </li>
                </ul>
              </div>

              <div className="relative border border-[#006694]/50 bg-black/50 p-4 mt-4">
                <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] animate-pulse shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
                <p className="text-xs text-cyan-100/50 leading-relaxed">
                  Create an account to begin your journey into xenomorphic pet
                  ownership. All purchases include lifetime support and
                  dimensional stabilization warranty.
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="mb-6 flex border-b-2 border-[#30D6D6]/30">
              <button
                onClick={() => handleModeSwitch("login")}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest transition-all ${
                  mode === "login"
                    ? "border-b-2 border-[#30D6D6] text-[#30D6D6]"
                    : "text-[#006694] hover:text-[#30D6D6]/70"
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => handleModeSwitch("signup")}
                className={`flex-1 pb-3 text-sm font-bold tracking-widest transition-all ${
                  mode === "signup"
                    ? "border-b-2 border-[#30D6D6] text-[#30D6D6]"
                    : "text-[#006694] hover:text-[#30D6D6]/70"
                }`}
              >
                SIGN_UP
              </button>
            </div>

            <div className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
                      [FIRST_NAME]
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name..."
                      className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                    />
                    {errors.firstName && (
                      <div className="mt-2 text-xs text-red-400 tracking-wider">
                        [{errors.firstName}]
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
                      [LAST_NAME]
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name..."
                      className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                    />
                    {errors.lastName && (
                      <div className="mt-2 text-xs text-red-400 tracking-wider">
                        [{errors.lastName}]
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
                  [EMAIL]
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@xenocorp.alien"
                  className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                />
                {errors.email && (
                  <div className="mt-2 text-xs text-red-400 tracking-wider">
                    [{errors.email}]
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
                  [PASSWORD]
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password..."
                  className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                />
                {errors.password && (
                  <div className="mt-2 text-xs text-red-400 tracking-wider">
                    [{errors.password}]
                  </div>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-widest text-[#30D6D6]">
                    [CONFIRM_PASSWORD]
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password..."
                    className="w-full border-2 border-[#006694]/50 bg-black/80 p-3 text-cyan-100 placeholder-[#006694]/50 focus:border-[#30D6D6] focus:outline-none focus:ring-1 focus:ring-[#30D6D6]"
                  />
                  {errors.confirmPassword && (
                    <div className="mt-2 text-xs text-red-400 tracking-wider">
                      [{errors.confirmPassword}]
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="group relative w-full overflow-hidden border-2 border-[#30D6D6] bg-black py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)]"
              >
                <span className="relative z-10">
                  {mode === "login" ? "AUTHENTICATE" : "CREATE_ACCOUNT"}
                </span>
              </button>

              {mode === "signup" && (
                <div className="relative border border-[#006694]/30 bg-black/30 p-3 mt-4">
                  <p className="text-xs text-cyan-100/50 leading-relaxed">
                    By creating an account, you acknowledge that genetic
                    anomalies are probable and that aXiom accepts no liability
                    for dimensional instabilities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_AUTH_TERMINAL_v2.0 | ENCRYPTION_ENABLED | SPECIMEN_ACCESS_READY
        </div>
      </div>
    </div>
  );
}