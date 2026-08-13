import { createContext, useContext, useState, type ReactNode } from "react";
import { strings, type Lang, type Strings } from "./i18n";

const LangContext = createContext<{ t: Strings; lang: Lang; toggle: () => void }>({
  t: strings.en,
  lang: "en",
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    (navigator.language || "en").toLowerCase().startsWith("hi") ? "hi" : "en"
  );
  const toggle = () => setLang((l) => (l === "en" ? "hi" : "en"));
  return (
    <LangContext.Provider value={{ t: strings[lang], lang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
