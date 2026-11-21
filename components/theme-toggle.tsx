"use client";

// Flips the theme and remembers it. The initial value is set before paint by
// the inline script in app/layout.tsx, so there is no flash.
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice lasts for this page only.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className="tag cursor-pointer rounded-full border border-rule px-3 py-1.5 hover:border-ink hover:text-ink"
    >
      Theme
    </button>
  );
}
