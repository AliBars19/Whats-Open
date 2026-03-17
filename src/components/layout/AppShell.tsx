"use client";

import { BottomNav } from "@/components/ui/BottomNav";
import { AuthGuard } from "./AuthGuard";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg-primary pb-16">
        {children}
        <BottomNav />
        <InstallPrompt />
      </div>
    </AuthGuard>
  );
}
