import clsx from "clsx";
import { useState } from "react";
import { Icon, Input, Dropdown, DropdownProps } from "semantic-ui-react";

import styles from "./admin-search-bar.module.scss";

export type Filters = {
  title: string;
  venue: string;
  date: string;
};

type Props = {
  className?: string;
  onFilterChange: (newFilters: Filters) => void;
  fluid?: boolean;
};

const venueOptions = [
  { key: "fs", text: "Flying Seed", value: "Flying Seed" },
  { key: "mpsh", text: "MPSH", value: "MPSH" },
  { key: "bt", text: "Bermuda Triangle", value: "Bermuda Triangle" },
  { key: "sr12", text: "Seminar Room 1/2", value: "Seminar Room 1/2" },
  { key: "sr3", text: "Seminar Room 3", value: "Seminar Room 3" },
  { key: "sr4", text: "Seminar Room 4", value: "Seminar Room 4" },
  { key: "sr5", text: "Seminar Room 5", value: "Seminar Room 5" },
  { key: "sr6", text: "Seminar Room 6", value: "Seminar Room 6" },
  { key: "rr", text: "Reading Room", value: "Reading Room" },
  { key: "tr1", text: "Theme Room 1", value: "Theme Room 1" },
  { key: "tr2", text: "Theme Room 2", value: "Theme Room 2" },
  { key: "tr3", text: "Theme Room 3", value: "Theme Room 3" },
];

function SearchBar({ className, onFilterChange, fluid = false }: Props) {
  const [filters, setFilters] = useState<Filters>({
    title: "",
    venue: "",
    date: "",
  });

  const setField = (field: keyof Filters, value: string) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const handleVenueChange = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ) => {
    setField("venue", data.value as string);
  };

  return (
    <div className={clsx(styles.container, fluid && styles.fluid, className)}>
      <Input
        fluid
        className={clsx(styles.input, styles.title)}
        icon={
          filters.title ? (
            <Icon name="times" link onClick={() => setField("title", "")} />
          ) : (
            <Icon name="search" />
          )
        }
        iconPosition="left"
        value={filters.title}
        onChange={(_, { value }) => setField("title", value)}
        placeholder="Search title..."
      />

      <Dropdown
        fluid
        selection
        search
        clearable
        className={clsx(styles.input, styles.small)}
        placeholder="Venue"
        options={venueOptions}
        value={filters.venue}
        onChange={handleVenueChange}
      />

      <Input
        fluid
        className={clsx(styles.input, styles.small)}
        icon={
          filters.date ? (
            <Icon name="times" link onClick={() => setField("date", "")} />
          ) : (
            <Icon name="calendar alternate outline" />
          )
        }
        iconPosition="left"
        input={{ type: "date", value: filters.date }}
        onChange={(_, { value }) => setField("date", value)}
        placeholder="Date"
      />
    </div>
  );
}

export default SearchBar;