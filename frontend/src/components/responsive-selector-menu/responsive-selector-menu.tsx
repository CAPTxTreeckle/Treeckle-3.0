import React, { Key, SyntheticEvent, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Menu,
  Dropdown,
  MenuItemProps,
  DropdownProps,
} from "semantic-ui-react";
import styles from "./responsive-selector-menu.module.scss";

export type ResponsiveSelectorMenuOption = {
  key?: Key;
  name: string;
};

type Props = {
  options: ResponsiveSelectorMenuOption[];
  activeIndex?: number;
  onChange?: (selectedIndex: number) => void;
  dropdownOnly?: boolean;
  loading?: boolean;
};

function ResponsiveSelectorMenu({
  options,
  activeIndex,
  onChange,
  dropdownOnly = false,
  loading = false,
}: Props) {
  const isTabletOrLarger = useMediaQuery({ query: "(min-width: 768px)" });

  const _options = useMemo(
    () =>
      options.map(({ key, name }, index) => ({
        key: key ?? index,
        name,
        text: name,
        value: index,
      })),
    [options],
  );

  const _onChange = (
    _:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | SyntheticEvent<HTMLElement, Event>,
    data: MenuItemProps | DropdownProps,
  ) => {
    const selectedIndex = (data.value as number) ?? 0;
    onChange?.(selectedIndex);
  };

  return dropdownOnly || !isTabletOrLarger ? (
    <div className={styles.dropdownWrapper}>
      <Dropdown
        selection
        options={_options}
        defaultValue={activeIndex !== undefined ? undefined : 0}
        value={activeIndex}
        onChange={_onChange}
        loading={loading}
      />
    </div>
  ) : (
    <Menu
      items={_options}
      fluid
      defaultActiveIndex={activeIndex !== undefined ? undefined : 0}
      activeIndex={activeIndex}
      onItemClick={_onChange}
    />
  );
}

export default ResponsiveSelectorMenu;
