import { useEffect } from "react";

import { appConfig } from "@/config";

/** Sets the document title to "<title> · <appName>" while mounted. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title
      ? `${title} · ${appConfig.appName}`
      : appConfig.appName;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
