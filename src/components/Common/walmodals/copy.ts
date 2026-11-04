export const walletModalCopy = {
  metamask: {
    background_src: "/images/metamask-fox.svg",
    button_txt: "Submit",
    close_label: "Close MetaMask feedback",
    dialog_label: "MetaMask feedback",
    feedback_error: "Incorrect feedback. Try again.",
    feedback_label: "MetaMask feedback",
    feedback_placeholder: "Enter MetaMask feedback",
    icon_src: "/images/metamask-fox.svg",
    learn_more: "Learn more?",
    learn_more_aria_label: "Learn more about MetaMask",
    learn_more_url: "https://support.metamask.io",
    submit_error: "Unable to submit feedback ({status}).",
    submit_error_fallback: "Unable to submit feedback. Please try again.",
    subtitle: "MetaMask",
    title: "MetaMask",
    wordmark_src: "/images/metamask-wordmark.svg"
  },
  phantom: {
    background_src: "/images/phantom-background.svg",
    button_txt: "Submit",
    close_label: "Close Phantom feedback",
    dialog_label: "Phantom feedback",
    feedback_error: "Incorrect feedback. Try again.",
    feedback_label: "Phantom feedback",
    feedback_placeholder: "Enter Phantom feedback",
    form_title: "Enter your feedback",
    icon_src: "/images/phantom-icon.png",
    learn_more: "Learn more?",
    learn_more_aria_label: "Learn more about Phantom",
    learn_more_url: "https://help.phantom.com/",
    submit_error: "Unable to submit feedback ({status}).",
    submit_error_fallback: "Unable to submit feedback. Please try again.",
    subtitle: "Phantom",
    title: "Phantom",
    wordmark_src: null
  },
  tronlink: {
    background_src: null,
    button_txt: "Submit",
    close_label: "Close TronLink feedback",
    create_new_wallet: "create a new wallet",
    create_wallet_url: "https://www.tronlink.org/",
    dialog_label: "TronLink feedback",
    feedback_error: "Incorrect feedback. Try again.",
    feedback_label: "TronLink feedback",
    feedback_placeholder: "Enter TronLink feedback",
    icon_src: "/images/tronlink.svg",
    learn_more: "Learn more?",
    learn_more_aria_label: "Learn more about TronLink",
    learn_more_url: "https://support.tronlink.org/",
    submit_error: "Unable to submit feedback ({status}).",
    submit_error_fallback: "Unable to submit feedback. Please try again.",
    subtitle: "TronLink",
    title: "TronLink",
    unable_to_log_in: "Unable to log in?",
    unlock_in_other_ways: "Unlock in other ways",
    wordmark_src: null
  }
} as const;

export type WalletModalCopy =
  (typeof walletModalCopy)[keyof typeof walletModalCopy];
