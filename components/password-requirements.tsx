"use client";

import React from "react";
import { CircleAlertIcon, CheckIcon } from "lucide-react";
import { useCommon } from "@/hooks/useTranslation";

interface PasswordRequirement {
  key: string;
  test: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const t = useCommon();

  const requirements: PasswordRequirement[] = [
    {
      key: "minLength",
      test: (pwd) => pwd.length >= 8,
    },
    {
      key: "hasSpecialChar",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
    {
      key: "hasNumber",
      test: (pwd) => /\d/.test(pwd),
    },
    {
      key: "hasUppercase",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
  ];

  const failedRequirements = requirements.filter(req => !req.test(password));
  const allRequirementsMet = failedRequirements.length === 0 && password.length > 0;

  if (password.length === 0) {
    return null;
  }

  if (allRequirementsMet) {
    return (
      <div className="rounded-md border border-green-500/50 px-4 py-3 text-green-600">
        <div className="flex gap-3">
          <CheckIcon
            className="mt-0.5 shrink-0 opacity-60"
            size={16}
            aria-hidden="true"
          />
          <div className="grow">
            <p className="text-sm font-medium">
              {t('passwordRequirements.allMet')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
      <div className="flex gap-3">
        <CircleAlertIcon
          className="mt-0.5 shrink-0 opacity-60"
          size={16}
          aria-hidden="true"
        />
        <div className="grow space-y-1">
          <p className="text-sm font-medium">
            {t('passwordRequirements.title')}
          </p>
          <ul className="list-inside list-disc text-sm opacity-80">
            {failedRequirements.map((req) => (
              <li key={req.key}>
                {t(`passwordRequirements.${req.key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}