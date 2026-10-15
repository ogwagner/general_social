import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router";

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
  const [walletPreference, setWalletPreference] =
    useState<WalletPreference>(null);
  const [isPreferenceLoaded, setIsPreferenceLoaded] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

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

  return (
    <AddressBackupReminderContext.Provider value={{ requestNavigation }}>
      {children}
      {isReminderOpen && walletPreference && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
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
                This reminder is from this website, not your wallet provider.
                Never share your password, recovery phrase, or private key.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
                onClick={() => setIsReminderOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
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
