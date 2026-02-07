"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as any;
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIOS());
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) return null;

  const canInstallAndroid = !ios && !!installEvent;

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const res = await installEvent.userChoice;
    if (res.outcome === "accepted") {
      setInstalled(true);
      setInstallEvent(null);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {canInstallAndroid && (
        <Button type="button" className="h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white" onClick={handleInstall}>
          Instalar app
        </Button>
      )}

      {ios && (
        <div className="relative">
          <Button
            type="button"
            className="h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white"
            onClick={() => setShowIOSHelp((v) => !v)}
          >
            Como instalar o app no iPhone
          </Button>
          {showIOSHelp && (
            <div className="absolute left-0 mt-2 w-[280px] rounded-lg border bg-white p-3 shadow-lg text-sm text-gray-700 z-50">
              <div className="font-semibold text-gray-900 mb-1">Passo a passo</div>
              <div>1. Toque no botão compartilhar do Safari.</div>
              <div>2. Selecione "Adicionar à Tela de Início".</div>
              <div>3. Confirme em "Adicionar".</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
