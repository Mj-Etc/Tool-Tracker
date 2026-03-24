"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useActiveTheme() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  return resolvedTheme;
}
