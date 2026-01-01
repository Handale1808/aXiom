"use client";

import { useState } from "react";
import LoginAbout from "@/lib/components/LoginAbout";
import FormWithHeading from "@/lib/components/FormWithHeading";

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
      console.log("Auth submitted:", {
        mode,
        email,
        password,
        ...(mode === "signup" && { firstName, lastName }),
      });
    }
  };

  const handleModeSwitch = (tabId: string) => {
    setMode(tabId as AuthMode);
    setErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  const tabs = [
    { id: "login", label: "LOGIN" },
    { id: "signup", label: "SIGN_UP" },
  ];

  const loginFields = [
    {
      name: "email",
      type: "email",
      label: "EMAIL",
      value: email,
      placeholder: "agent@xenocorp.alien",
      error: errors.email,
      onChange: setEmail,
    },
    {
      name: "password",
      type: "password",
      label: "PASSWORD",
      value: password,
      placeholder: "Enter secure password...",
      error: errors.password,
      onChange: setPassword,
    },
  ];

  const signupFields = [
    {
      name: "firstName",
      type: "text",
      label: "FIRST_NAME",
      value: firstName,
      placeholder: "Enter first name...",
      error: errors.firstName,
      onChange: setFirstName,
    },
    {
      name: "lastName",
      type: "text",
      label: "LAST_NAME",
      value: lastName,
      placeholder: "Enter last name...",
      error: errors.lastName,
      onChange: setLastName,
    },
    {
      name: "email",
      type: "email",
      label: "EMAIL",
      value: email,
      placeholder: "agent@xenocorp.alien",
      error: errors.email,
      onChange: setEmail,
    },
    {
      name: "password",
      type: "password",
      label: "PASSWORD",
      value: password,
      placeholder: "Enter secure password...",
      error: errors.password,
      onChange: setPassword,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "CONFIRM_PASSWORD",
      value: confirmPassword,
      placeholder: "Re-enter password...",
      error: errors.confirmPassword,
      onChange: setConfirmPassword,
    },
  ];

  const fields = mode === "login" ? loginFields : signupFields;

  const submitButton = {
    text: mode === "login" ? "AUTHENTICATE" : "CREATE_ACCOUNT",
    onClick: handleSubmit,
    disabled: false,
  };

  const disclaimer =
    mode === "signup"
      ? "By creating an account, you acknowledge that genetic anomalies are probable and that aXiom accepts no liability for dimensional instabilities."
      : undefined;

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
          <LoginAbout />
          <FormWithHeading
            tabs={tabs}
            activeTab={mode}
            onTabChange={handleModeSwitch}
            fields={fields}
            submitButton={submitButton}
            disclaimer={disclaimer}
          />
        </div>

        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_AUTH_TERMINAL_v2.0 | ENCRYPTION_ENABLED | SPECIMEN_ACCESS_READY
        </div>
      </div>
    </div>
  );
}