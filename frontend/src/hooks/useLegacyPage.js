import { useEffect } from "react";

export default function useLegacyPage(stylesheetHref, title) {
  useEffect(() => {
    const previousTitle = document.title;
    let link = null;

    if (stylesheetHref) {
      link = document.querySelector(`link[data-legacy-page="${stylesheetHref}"]`);

      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = stylesheetHref;
        link.dataset.legacyPage = stylesheetHref;
        document.head.appendChild(link);
      }
    }

    if (title) {
      document.title = title;
    }

    return () => {
      if (link?.parentNode) {
        link.parentNode.removeChild(link);
      }

      document.title = previousTitle;
    };
  }, [stylesheetHref, title]);
}
