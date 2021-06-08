import { ReactNode } from "react";
import { createMedia } from "@artsy/fresnel";

type Props = {
  children: ReactNode;
};

const appMedia = createMedia({
  breakpoints: {
    base: 0,
    mobile: 320,
    tablet: 768,
    computer: 992,
    largeScreen: 1200,
    widescreen: 1920,
  },
});

export const { Media } = appMedia;
const { MediaContextProvider } = appMedia;

function ResponsiveProvider({ children }: Props) {
  return <MediaContextProvider>{children}</MediaContextProvider>;
}

export default ResponsiveProvider;
