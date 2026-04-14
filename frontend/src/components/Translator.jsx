import { useEffect, useMemo, useState } from "react";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "zh-CN", label: "Chinese" },
];

const GOOGLE_TRANSLATE_COOKIE = "googtrans";

function setTranslateCookie(language) {
  const cookieValue = language === "en" ? "/auto/en" : `/auto/${language}`;
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=${cookieValue};path=/`;
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=${cookieValue};path=/;domain=${window.location.hostname}`;
}

function Translator() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  const label = useMemo(() => {
    return (
      LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ||
      "Translate"
    );
  }, [language]);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (document.getElementById("google-translate-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    setTranslateCookie(language);
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const handleChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setTranslateCookie(nextLanguage);
    localStorage.setItem("preferredLanguage", nextLanguage);
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="google-translate-mount" />
      <div className="site-translator">
        <label className="site-translator-label" htmlFor="site-language">
          <i className="fa-solid fa-language" />
          <span>{label}</span>
        </label>
        <select
          id="site-language"
          className="site-translator-select"
          value={language}
          onChange={handleChange}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default Translator;
