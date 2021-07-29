import { ReactNode, useEffect, useState } from "react";
import ResponsiveSelectorMenu, {
  ResponsiveSelectorMenuOption,
} from "../responsive-selector-menu";

export type TabOption = {
  title?: string;
  pane: ReactNode;
} & ResponsiveSelectorMenuOption;

type Props = {
  options: TabOption[];
  showTitle?: boolean;
} & Omit<Parameters<typeof ResponsiveSelectorMenu>[0], "options">;

function Tab({
  options,
  activeIndex,
  onChange,
  showTitle = true,
  ...otherSelectorMenuProps
}: Props) {
  const [_activeIndex, _setActiveIndex] = useState(activeIndex ?? 0);

  useEffect(() => {
    if (activeIndex !== undefined) {
      _setActiveIndex(activeIndex);
    }
  }, [activeIndex]);

  const option = options[_activeIndex];

  return option ? (
    <>
      {showTitle && <h1>{option.title ?? option.name}</h1>}
      <ResponsiveSelectorMenu
        options={options}
        activeIndex={_activeIndex}
        onChange={(selectedIndex) => {
          _setActiveIndex(selectedIndex);
          onChange?.(selectedIndex);
        }}
        {...otherSelectorMenuProps}
      />

      {option.pane}
    </>
  ) : null;
}

export default Tab;
