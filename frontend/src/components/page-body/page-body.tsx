import clsx from "clsx";
import { createContext, ReactNode, useMemo, useState } from "react";

import styles from "./page-body.module.scss";

type PageBodyContextType = {
  body: Element | (Window & typeof globalThis) | null;
};

export const PageBodyContext = createContext<PageBodyContextType>({
  body: window,
});

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const mergeRefs = (...refs: any[]) => {
//   const filteredRefs = refs.filter(Boolean);

//   if (filteredRefs.length === 0) {
//     return null;
//   }

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return (instance: any) =>
//     filteredRefs.forEach((ref) => {
//       if (typeof ref === "function") {
//         ref(element);
//       } else if (ref) {
//         ref.current = element;
//       }
//     });
// };

type Props = { className?: string; children: ReactNode };

function PageBody({ className, children }: Props) {
  const [body, setBody] = useState<
    Element | (Window & typeof globalThis) | null
  >(window);

  const contextValue = useMemo(() => ({ body }), [body]);

  return (
    <div ref={setBody} className={clsx(styles.pageBody, className)}>
      <PageBodyContext.Provider value={contextValue}>
        {children}
      </PageBodyContext.Provider>
    </div>
  );
}

export default PageBody;
