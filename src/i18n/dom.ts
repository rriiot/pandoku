// Applies translations to the DOM. Elements opt in by tagging themselves with:
//   data-i18n       — translates textContent
//   data-i18n-title — translates the `title` attribute
//   data-i18n-aria  — translates the `aria-label` attribute

import { getLocale, LOCALE_LABELS, LOCALES, setLocale, t, type Locale } from "./index";

export function applyI18n(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (key) el.title = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria;
    if (key) el.setAttribute("aria-label", t(key));
  });
}

/** Build the language picker grid inside `container`. The grid visual language
 *  mirrors the other `button.primary` / secondary buttons so it looks native. */
export function buildLanguageGrid(container: HTMLElement): void {
  container.innerHTML = "";
  const active = getLocale();
  for (const loc of LOCALES) {
    const btn = document.createElement("button");
    btn.className = "lang-btn";
    btn.dataset.loc = loc;
    btn.textContent = LOCALE_LABELS[loc];
    if (loc === active) btn.classList.add("active");
    btn.addEventListener("click", () => {
      setLocale(loc as Locale);
      // Reflect active state immediately.
      container.querySelectorAll<HTMLButtonElement>(".lang-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.loc === loc);
      });
    });
    container.appendChild(btn);
  }
}
