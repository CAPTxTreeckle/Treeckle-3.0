import { ReactNode } from "react";
import Linkify from "react-linkify";

type Props = {
  children: ReactNode;
  className?: string;
};

function LinkifyTextViewer({ children, className }: Props) {
  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => {
        const isEmail = decoratedHref.startsWith("mailto:");

        return (
          <a
            className={className}
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
