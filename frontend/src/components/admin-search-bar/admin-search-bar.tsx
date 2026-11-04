import clsx from "clsx";
import { useState } from "react";
import { Icon, Input, Dropdown, DropdownProps } from "semantic-ui-react";

import { BookingDateFilter } from "../../types/bookings";
import styles from "./admin-search-bar.module.scss";

export type Filters = {
  title: string;
  venue: string;
  date: BookingDateFilter | "";
  status: string;
};

type Props = {
  className?: string;
  onFilterChange: (newFilters: Filters) => void;
  fluid?: boolean;
  disabled?: boolean;
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

const statusOptions = [
  { key: "app", text: "Approved", value: "Approved" },
  { key: "pen", text: "Pending", value: "Pending" },
  { key: "rej", text: "Rejected", value: "Rejected" },
  { key: "cnl", text: "Cancelled", value: "Cancelled" }
];

const dateOptions = [
  { key: "today", text: "Today", value: "today" },
  { key: "tomorrow", text: "Tomorrow", value: "tomorrow" },
  { key: "next3days", text: "Next 3 days", value: "next3days" },
  { key: "nextweek", text: "Next week", value: "nextweek" },
  { key: "next2weeks", text: "Next 2 weeks", value: "next2weeks" },
  { key: "nextmonth", text: "Next month", value: "nextmonth" },
  { key: "next3months", text: "Next 3 months", value: "next3months" },
  { key: "nextyear", text: "Next year", value: "nextyear" },
  { key: "yesterday", text: "Yesterday", value: "yesterday" },
  { key: "last3days", text: "Last 3 days", value: "last3days" },
  { key: "lastweek", text: "Last week", value: "lastweek" },
  { key: "last2weeks", text: "Last 2 weeks", value: "last2weeks" },
  { key: "lastmonth", text: "Last month", value: "lastmonth" },
  { key: "last3months", text: "Last 3 months", value: "last3months" },
  { key: "lastyear", text: "Last year", value: "lastyear" },
];

function SearchBar({ className, onFilterChange, fluid = false, disabled = false }: Props) {
  const [filters, setFilters] = useState<Filters>({
    title: "",
    venue: "",
    date: "",
    status: ""
  });

  const setField = (field: keyof Filters, value: string) => {
    if (disabled) return;
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

  const handleStatusChange = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ) => {
    setField("status", data.value as string);
  };

  const handleDateChange = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps,
  ) => {
    const value = data.value as string;

    if (!value) {
      setField("date", "");
      return;
    }

    setField("date", value as BookingDateFilter);
  };

  return (
    <div className={clsx(styles.container, fluid && styles.fluid, className, disabled && styles.disabled)}>
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
        disabled={disabled}
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
        disabled={disabled}
      />

      <Dropdown
        fluid
        selection
        clearable
        className={clsx(styles.input, styles.small)}
        placeholder="Date"
        options={dateOptions}
        value={filters.date}
        onChange={handleDateChange}
        disabled={disabled}
      />

      <Dropdown
        fluid
        selection
        search
        clearable
        className={clsx(styles.input, styles.small)}
        placeholder="Status"
        options={statusOptions}
        value={filters.status}
        onChange={handleStatusChange}
        disabled={disabled}
      />
    </div>
  );
}

export default SearchBar;
