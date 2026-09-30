/** Cross-component signal: a unit was picked somewhere on the page (plan, plates, directory). */
export const UNIT_SELECT = "unit:select";

function smooth(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Prefills the contact form with a unit and brings the form into view. */
export function requestUnit(id: string) {
  window.dispatchEvent(new CustomEvent(UNIT_SELECT, { detail: id }));
  document.getElementById("contact")?.scrollIntoView({ behavior: smooth(), block: "start" });
}
