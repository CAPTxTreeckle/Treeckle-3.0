import { ReactNode } from "react";
import Linkify from "react-linkify";

type Props = {
  children: ReactNode;
};

function LinkifyTextViewer({ children }: Props) {
  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => {
        const isEmail = decoratedHref.startsWith("mailto:");

        return (
          <a
            target={isEmail ? undefined : "_blank"}
            rel="noopener noreferrer"
            href={decoratedHref}
            key={key}
          >
            {decoratedText}
          </a>
        );
      }}
    >
      {children}
    </Linkify>
  );
}

export default LinkifyTextViewer;
