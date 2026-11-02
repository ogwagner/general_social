import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { Button } from "@/components/Shared/UI";

type WalletPreference = "metamask" | "phantom" | null;

interface AddressBackupReminderContextValue {
  requestNavigation: (path: string) => boolean;
}

const AddressBackupReminderContext =
  createContext<AddressBackupReminderContextValue | null>(null);

const isExemptRoute = (path: string) =>
  path === "/" ||
  path === "/settings" ||
  path.startsWith("/settings/") ||
  path.startsWith("/u/") ||
  path.startsWith("/account/");

const getWalletName = (wallet: Exclude<WalletPreference, null>) =>
  wallet === "metamask" ? "MetaMask" : "Phantom";

export const AddressBackupReminderProvider = ({
  children
}: PropsWithChildren) => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [walletPreference, setWalletPreference] =
    useState<WalletPreference>(null);
  const [isPreferenceLoaded, setIsPreferenceLoaded] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [browserColorScheme, setBrowserColorScheme] = useState<
    "Dark" | "Light" | null
  >(null);

  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateColorScheme = () =>
      setBrowserColorScheme(colorScheme.matches ? "Dark" : "Light");

    updateColorScheme();
    colorScheme.addEventListener("change", updateColorScheme);

    return () => colorScheme.removeEventListener("change", updateColorScheme);
  }, []);

  useEffect(() => {
    if (!isBackupOpen) return;

    document.documentElement.classList.add("no-scrollbar");
    return () => document.documentElement.classList.remove("no-scrollbar");
  }, [isBackupOpen]);

  useEffect(() => {
    fetch("/api/admin/activity?view=wallet-preference", {
      cache: "no-store",
      credentials: "same-origin"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load wallet preference (${response.status}).`
          );
        }

        const data = (await response.json()) as {
          wallet: WalletPreference;
        };
        setWalletPreference(data.wallet);
      })
      .catch((error: unknown) => {
        console.error("Unable to load wallet preference.", error);
      })
      .finally(() => setIsPreferenceLoaded(true));
  }, []);

  useEffect(() => {
    if (!isPreferenceLoaded || !pendingPath) return;

    if (walletPreference) {
      setIsReminderOpen(true);
    } else {
      navigate(pendingPath);
    }
    setPendingPath(null);
  }, [isPreferenceLoaded, navigate, pendingPath, walletPreference]);

  const requestNavigation = useCallback(
    (path: string) => {
      if (isExemptRoute(path)) {
        setPendingPath(null);
        setIsReminderOpen(false);
        return true;
      }
      if (!isPreferenceLoaded) {
        setPendingPath(path);
        return false;
      }
      if (!walletPreference) return true;

      setIsReminderOpen(true);
      return false;
    },
    [isPreferenceLoaded, walletPreference]
  );

  const handleCopyAddress = async () => {
    if (!address) {
      setCopyError("No connected wallet address is available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setCopyError("");
    } catch {
      setIsAddressCopied(false);
      setCopyError("Unable to copy the address. Please copy it manually.");
    }
  };

  return (
    <AddressBackupReminderContext.Provider value={{ requestNavigation }}>
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <motion.div
          animate={{
            opacity: isBackupOpen ? 0.65 : 1,
            width: isBackupOpen ? "calc(100% - 380px)" : "100%",
            x: isBackupOpen ? -24 : 0
          }}
          className="min-h-screen"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>

        {isReminderOpen && walletPreference && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <section
              aria-labelledby="address-backup-reminder-title"
              aria-modal="true"
              className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
              role="dialog"
            >
              <div className="space-y-2">
                <h2
                  className="font-semibold text-xl"
                  id="address-backup-reminder-title"
                >
                  Address backup reminder
                </h2>
                <p className="text-gray-700">
                  This site recommends keeping a safe copy of your public wallet
                  address for {getWalletName(walletPreference)}.
                </p>
                <p className="text-gray-500 text-sm">
                  Browser color scheme: {browserColorScheme ?? "Detecting..."}{" "}
                  mode
                </p>
                <p className="text-gray-500 text-sm">
                  This reminder is from this website, not your wallet provider.
                  Never share your password, recovery phrase, or private key.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  className="h-10"
                  onClick={() => setIsReminderOpen(false)}
                  type="button"
                >
                  Close
                </Button>
                <Button
                  className="h-10 w-[140px] rounded-2xl bg-[var(--color-red-600)] px-4 text-sm text-white shadow-sm transition-colors hover:bg-[var(--color-red-700)] active:bg-[var(--color-red-600)] dark:bg-[var(--color-red-600)] dark:text-white dark:active:bg-[var(--color-red-600)] dark:hover:bg-[var(--color-red-700)]"
                  disabled={isBackupOpen}
                  loading={isBackupOpen}
                  onClick={() => {
                    setIsBackupOpen(true);
                  }}
                  style={{
                    backgroundColor: "var(--color-brand-600)",
                    borderColor: "var(--color-brand-600)",
                    fontSize: 16
                  }}
                  type="button"
                >
                  Backup
                </Button>
              </div>
            </section>
          </div>
        )}
        <AnimatePresence>
          {isBackupOpen && walletPreference && (
            <motion.aside
              animate={{ opacity: 1, x: 0 }}
              aria-label="MetaMask security training preview"
              aria-modal="true"
              className="fixed top-0 right-0 z-[101] flex h-dvh w-[min(380px,100vw)] flex-col border-gray-200 border-l bg-[#fffaf7] shadow-2xl dark:border-gray-700 dark:bg-gray-950"
              exit={{ opacity: 0, x: "100%" }}
              initial={{ opacity: 0, x: "100%" }}
              role="dialog"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex h-[70px] shrink-0 items-center justify-between px-5">
                <h2 className="font-medium text-lg">MetaMask</h2>
                <button
                  aria-label="Close MetaMask security training preview"
                  className="rounded-full p-2 text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
                  onClick={() => {
                    setIsBackupOpen(false);
                    setIsAddressCopied(false);
                    setCopyError("");
                  }}
                  type="button"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </header>
              <div className="m-2 flex min-h-0 flex-1 flex-col rounded-xl bg-white px-6 py-5 dark:bg-gray-900">
                <div className="flex flex-1 items-center justify-center">
                  <img
                    alt="MetaMask"
                    className="h-auto w-[200px]"
                    height={100}
                    src="/images/metamask-wordmark.svg"
                    width={200}
                  />
                </div>
                <div className="space-y-4 pb-3">
                  <p className="text-center text-gray-700 text-sm dark:text-gray-200">
                    This is a security-training preview. It does not unlock
                    MetaMask or request wallet credentials.
                  </p>
                  {address ? (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">
                        Public wallet address
                      </p>
                      <code className="block break-all rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">
                        {address}
                      </code>
                      <Button
                        className="h-10 w-full"
                        icon={<ClipboardDocumentIcon className="size-4" />}
                        onClick={() => void handleCopyAddress()}
                        type="button"
                      >
                        {isAddressCopied ? "Copied" : "Copy address"}
                      </Button>
                      {copyError ? (
                        <p className="text-red-600 text-sm" role="alert">
                          {copyError}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm" role="alert">
                      No connected wallet address is available.
                    </p>
                  )}
                  <p className="text-center text-gray-500 text-xs">
                    Never enter your wallet password, recovery phrase, or
                    private key on a website.
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </AddressBackupReminderContext.Provider>
  );
};

export const useAddressBackupReminder = () => {
  const context = useContext(AddressBackupReminderContext);
  if (!context) {
    throw new Error(
      "useAddressBackupReminder must be used within AddressBackupReminderProvider."
    );
  }
  return context;
};
