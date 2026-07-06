'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

export type StorePwaInstallPromptProps = {
  storeName: string;
  storeShortName: string;
  storeIcon: string | null;
  themeColor: string;
  slug: string;
};

const DISMISSED_STORAGE_PREFIX = 'lojacomapp-store-pwa-install-dismissed';

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function getPlatform() {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isIos: false,
      isMobile: false,
      isSafari: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  const isSafari =
    /safari/.test(userAgent) &&
    !/chrome|crios|fxios|edgios|opr\//.test(userAgent);

  return {
    isAndroid,
    isIos,
    isMobile: isAndroid || isIos,
    isSafari,
  };
}

export default function StorePwaInstallPrompt({
  storeName,
  storeShortName,
  storeIcon,
  themeColor,
  slug,
}: StorePwaInstallPromptProps) {
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState(() => getPlatform());

  const dismissedStorageKey = `${DISMISSED_STORAGE_PREFIX}:${slug}`;

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');

    const frame = window.requestAnimationFrame(() => {
      setPlatform(getPlatform());
      setIsStandalone(isStandaloneMode());
      setIsDismissed(
        window.sessionStorage.getItem(dismissedStorageKey) === 'true',
      );
    });

    function handleDisplayModeChange() {
      setIsStandalone(isStandaloneMode());
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsStandalone(true);
      setDeferredPrompt(null);
    }

    media.addEventListener?.('change', handleDisplayModeChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener?.('change', handleDisplayModeChange);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissedStorageKey]);

  function dismissPrompt() {
    window.sessionStorage.setItem(dismissedStorageKey, 'true');
    setIsDismissed(true);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } finally {
      setIsInstalling(false);
    }
  }

  async function handleCopyLink() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    } else {
      const input = document.createElement('textarea');
      input.value = window.location.href;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    setCopiedLink(true);
  }

  if (isStandalone || isDismissed || !platform.isMobile) {
    return null;
  }

  const showAndroidInstall = platform.isAndroid && Boolean(deferredPrompt);
  const showIosGuide = platform.isIos;

  if (!showAndroidInstall && !showIosGuide) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div
          className="px-5 py-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColor}, #111827)`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl bg-white/95 text-zinc-950 shadow-sm">
                {storeIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storeIcon}
                    alt={`Logo ${storeName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBagIcon className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  App da loja
                </p>
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  Instalar {storeShortName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissPrompt}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar aviso de instalação"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {showAndroidInstall && (
            <>
              <div className="flex items-start gap-3 rounded-3xl bg-[#f7f7f5] p-4">
                <div
                  className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white"
                  style={{ color: themeColor }}
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Abra {storeName} como app
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Instale a loja no celular para comprar mais rápido e voltar
                    quando quiser pela tela inicial.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: themeColor }}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  {isInstalling ? 'Abrindo instalação...' : 'Instalar app'}
                </button>

                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50"
                >
                  Agora não
                </button>
              </div>
            </>
          )}

          {showIosGuide && (
            <>
              <div className="flex items-start gap-3 rounded-3xl bg-[#f7f7f5] p-4">
                <div
                  className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white"
                  style={{ color: themeColor }}
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Instale no iPhone
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Adicione {storeName} à tela inicial para abrir a loja como
                    um app.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-[#f7f7f5] p-4">
                <GuideStep
                  icon={ArrowUpOnSquareIcon}
                  iconColor={themeColor}
                  title="1. Toque em Compartilhar"
                  description="Use o botão de compartilhamento do Safari."
                />

                <GuideStep
                  icon={ArrowDownTrayIcon}
                  iconColor={themeColor}
                  title="2. Toque em Adicionar à Tela de Início"
                  description={`Depois confirme para instalar ${storeShortName}.`}
                />
              </div>

              {!platform.isSafari && (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">
                  Para instalar no iPhone, copie este link, abra o Safari e
                  cole na barra de endereço.
                </div>
              )}

              <div className="mt-5 grid gap-3">
                {!platform.isSafari && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition"
                    style={{ backgroundColor: themeColor }}
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    {copiedLink ? 'Link copiado' : 'Copiar link'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50"
                >
                  Entendi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GuideStep({
  icon: Icon,
  iconColor,
  title,
  description,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 [&+&]:mt-4">
      <div
        className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-white"
        style={{ color: iconColor }}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
