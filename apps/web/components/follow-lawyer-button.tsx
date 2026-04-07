"use client";

import { useState } from "react";

import type { SocialFollowResponse } from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface FollowLawyerButtonProps {
  handle: string;
  mode?: "follow" | "connect";
  className?: string;
}

export function FollowLawyerButton({
  handle,
  mode = "follow",
  className = "button-secondary"
}: FollowLawyerButtonProps) {
  const [result, setResult] = useState<SocialFollowResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          handle,
          mode
        })
      });

      if (!response.ok) {
        throw new Error("Follow request failed.");
      }

      const payload = (await response.json()) as SocialFollowResponse;
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {loading
        ? mode === "connect"
          ? "Connecting..."
          : "Following..."
        : result
          ? result.state === "connected"
            ? "Connected"
            : "Following"
          : mode === "connect"
            ? "Connect"
            : "Follow"}
    </button>
  );
}
