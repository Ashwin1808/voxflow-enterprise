export type Lang = "en" | "hi";

export const strings = {
  en: {
    langLabel: "हिंदी",
    appName: "VoxFlow Secure Verify",
    tagline: "Fraud alert · transaction verification",
    bannerTitle: "Transaction verification",
    bannerSub: "We detected an unusual transaction on your card",
    merchant: "Merchant",
    amount: "Amount",
    card: "Card",
    phone: "Registered number",
    time: "Time",
    secureNote: "This is a secure one-time verification link. We will never ask for your OTP, PIN or full card number.",
    verifyCta: "Verify transaction",
    verifyCtaSub: "One-time verification code required",
    otpTitle: "Enter verification code",
    otpSub: "Your agent will share a one-time code with you over the call",
    otpPlaceholder: "6-digit code",
    otpSubmit: "Verify code",
    otpResend: "Request new code",
    otpInvalid: "Incorrect code. Try again.",
    otpExpired: "Code expired — request a new one.",
    otpError: "Something went wrong. Try again.",
    otpHint: "We never ask for your bank OTP or card PIN.",
    decisionTitle: "Was this transaction yours?",
    decisionSub: "Your response decides the next step",
    approve: "Yes, it was me",
    approveSub: "Transaction confirmed",
    decline: "No, I didn't do this",
    declineSub: "Card blocked, case raised",
    submitting: "Recording your response…",
    successTitle: "Response recorded",
    successSub: "Thank you. Your fraud verification is complete.",
    reference: "Reference ID",
    outcomeApproved: "Transaction confirmed",
    outcomeDeclined: "Transaction declined · card blocked",
    receipt: "Download receipt",
    nextBanner: "Our fraud desk will not contact you about this again.",
    errorTitle: "Link unavailable",
    errorSub: "This link is invalid, expired, or has already been used.",
    errorContact: "Contact your bank's customer care for assistance.",
    poweredBy: "Powered by VoxFlow Enterprise · Protected by VoxFlow Security",
    backToDetails: "Back to transaction details",
  },
  hi: {
    langLabel: "English",
    appName: "VoxFlow सुरक्षित सत्यापन",
    tagline: "धोखाधड़ी अलर्ट · लेनदेन सत्यापन",
    bannerTitle: "लेनदेन सत्यापन",
    bannerSub: "आपके कार्ड पर एक असामान्य लेनदेन पाया गया",
    merchant: "व्यापारी",
    amount: "राशि",
    card: "कार्ड",
    phone: "पंजीकृत नंबर",
    time: "समय",
    secureNote: "यह एक सुरक्षित वन-टाइम सत्यापन लिंक है। हम कभी OTP, PIN या पूरा कार्ड नंबर नहीं पूछेंगे।",
    verifyCta: "लेनदेन सत्यापित करें",
    verifyCtaSub: "वन-टाइम सत्यापन कोड आवश्यक है",
    otpTitle: "सत्यापन कोड दर्ज करें",
    otpSub: "आपका एजेंट कॉल पर एक कोड साझा करेगा",
    otpPlaceholder: "6 अंकों का कोड",
    otpSubmit: "कोड सत्यापित करें",
    otpResend: "नया कोड मांगें",
    otpInvalid: "गलत कोड। फिर से कोशिश करें।",
    otpExpired: "कोड समाप्त हो गया — नया कोड मांगें।",
    otpError: "कुछ गलत हुआ। फिर से कोशिश करें।",
    otpHint: "हम कभी आपका बैंक OTP या कार्ड PIN नहीं पूछते।",
    decisionTitle: "क्या यह लेनदेन आपका था?",
    decisionSub: "आपका उत्तर अगला कदम तय करता है",
    approve: "हाँ, यह मेरा था",
    approveSub: "लेनदेन सत्यापित",
    decline: "नहीं, मैंने यह नहीं किया",
    declineSub: "कार्ड ब्लॉक, केस दर्ज",
    submitting: "आपका उत्तर दर्ज किया जा रहा है…",
    successTitle: "उत्तर दर्ज हो गया",
    successSub: "धन्यवाद। आपका धोखाधड़ी सत्यापन पूर्ण हुआ।",
    reference: "संदर्भ ID",
    outcomeApproved: "लेनदेन सत्यापित",
    outcomeDeclined: "लेनदेन अस्वीकृत · कार्ड ब्लॉक",
    receipt: "रसीद डाउनलोड करें",
    nextBanner: "हमारी धोखाधड़ी टीम इस बारे में दोबारा संपर्क नहीं करेगी।",
    errorTitle: "लिंक उपलब्ध नहीं है",
    errorSub: "यह लिंक अमान्य, समाप्त, या पहले उपयोग हो चुका है।",
    errorContact: "सहायता के लिए अपने बैंक की ग्राहक सेवा से संपर्क करें।",
    poweredBy: "VoxFlow Enterprise द्वारा संचालित · VoxFlow सुरक्षा द्वारा संरक्षित",
    backToDetails: "लेनदेन विवरण पर वापस जाएँ",
  },
} satisfies Record<Lang, unknown>;

export type Strings = {
  langLabel: string;
  appName: string;
  tagline: string;
  bannerTitle: string;
  bannerSub: string;
  merchant: string;
  amount: string;
  card: string;
  phone: string;
  time: string;
  secureNote: string;
  verifyCta: string;
  verifyCtaSub: string;
  otpTitle: string;
  otpSub: string;
  otpPlaceholder: string;
  otpSubmit: string;
  otpResend: string;
  otpInvalid: string;
  otpExpired: string;
  otpError: string;
  otpHint: string;
  decisionTitle: string;
  decisionSub: string;
  approve: string;
  approveSub: string;
  decline: string;
  declineSub: string;
  submitting: string;
  successTitle: string;
  successSub: string;
  reference: string;
  outcomeApproved: string;
  outcomeDeclined: string;
  receipt: string;
  nextBanner: string;
  errorTitle: string;
  errorSub: string;
  errorContact: string;
  poweredBy: string;
  backToDetails: string;
};
