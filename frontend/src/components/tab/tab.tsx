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
  activeIndex?: number;
  onChange?: (selectedIndex: number) => void;
  showTitle?: boolean;
};

function Tab({ options, activeIndex, onChange, showTitle = true }: Props) {
  const [_activeIndex, _setActiveIndex] = useState(activeIndex ?? 0);

  useEffect(() => {
    if (activeIndex !== undefined) {
      _setActiveIndex(activeIndex);
    }
  }, [activeIndex]);

  const option = options[_activeIndex];

  return (
    option && (
      <>
        {showTitle && <h1>{option.title ?? option.name}</h1>}
        <ResponsiveSelectorMenu
          options={options}
          activeIndex={activeIndex}
          onChange={(selectedIndex) => {
            _setActiveIndex(selectedIndex);
            onChange?.(selectedIndex);
          }}
        />

        {option.pane}
      </>
    )
  );
}

export default Tab;
