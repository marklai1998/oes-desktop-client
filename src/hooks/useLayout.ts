import constate from "constate";
import { useMemo } from "react";
import { useWindowSize } from "react-use";

import { layoutType } from "../constants/layoutType";

const getLayout = ({ isMobileWidth }: { isMobileWidth: boolean }) => {
  const isMobile = isMobileWidth;
  if (!isMobile) return layoutType.DESKTOP;
  return layoutType.MOBILE;
};

export const [UseLayoutProvider, useLayout] = constate(() => {
  const { width } = useWindowSize(700);

  const currentLayout = useMemo(
    () => getLayout({ isMobileWidth: width ? width < 600 : false }),
    [width]
  );

  return currentLayout;
});
