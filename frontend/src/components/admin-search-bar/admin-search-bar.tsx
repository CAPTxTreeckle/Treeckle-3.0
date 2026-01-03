import clsx from "clsx";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { useState, useMemo } from "react";
import { Icon, Input, Dropdown, DropdownProps } from "semantic-ui-react";

import styles from "./admin-search-bar.module.scss";

export type Filters = {
  title: string;
  venue: string;
  date: string;
  status: string;
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

const statusOptions = [
  { key: "app", text: "Approved", value: "Approved" },
  { key: "pen", text: "Pending", value: "Pending" },
  { key: "rej", text: "Rejected", value: "Rejected" }
];

const dateOptions = [
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

function SearchBar({ className, onFilterChange, fluid = false }: Props) {
  const [filters, setFilters] = useState<Filters>({
    title: "",
    venue: "",
    date: "",
    status: ""
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

    const today = new Date();
    let newDate = today;

    switch (value) {
      case "tomorrow":
        newDate = addDays(today, 1);
        break;
      case "next3days":
        newDate = addDays(today, 3);
        break;
      case "nextweek":
        newDate = addWeeks(today, 1);
        break;
      case "next2weeks":
        newDate = addWeeks(today, 2);
        break;
      case "nextmonth":
        newDate = addMonths(today, 1);
        break;
      case "next3months":
        newDate = addMonths(today, 3);
        break;
      case "nextyear":
        newDate = addYears(today, 1);
        break;
      case "yesterday":
        newDate = subDays(today, 1);
        break;
      case "last3days":
        newDate = subDays(today, 3);
        break;
      case "lastweek":
        newDate = subWeeks(today, 1);
        break;
      case "last2weeks":
        newDate = subWeeks(today, 2);
        break;
      case "lastmonth":
        newDate = subMonths(today, 1);
        break;
      case "last3months":
        newDate = subMonths(today, 3);
        break;
      case "lastyear":
        newDate = subYears(today, 1);
        break;
    }

    setField("date", format(newDate, "yyyy-MM-dd"));
  };

  const currentShortcutValue = useMemo(() => {
    if (!filters.date) return "";
    const today = new Date();
    const target = filters.date;

    if (target === format(addDays(today, 1), "yyyy-MM-dd")) return "tomorrow";
    if (target === format(addDays(today, 3), "yyyy-MM-dd")) return "next3days";
    if (target === format(addWeeks(today, 1), "yyyy-MM-dd")) return "nextweek";
    if (target === format(addWeeks(today, 2), "yyyy-MM-dd")) return "next2weeks";
    if (target === format(addMonths(today, 1), "yyyy-MM-dd")) return "nextmonth";
    if (target === format(addMonths(today, 3), "yyyy-MM-dd")) return "next3months";
    if (target === format(addYears(today, 1), "yyyy-MM-dd")) return "nextyear";
    if (target === format(subDays(today, 1), "yyyy-MM-dd")) return "yesterday";
    if (target === format(subDays(today, 3), "yyyy-MM-dd")) return "last3days";
    if (target === format(subWeeks(today, 1), "yyyy-MM-dd")) return "lastweek";
    if (target === format(subWeeks(today, 2), "yyyy-MM-dd")) return "last2weeks";
    if (target === format(subMonths(today, 1), "yyyy-MM-dd")) return "lastmonth";
    if (target === format(subMonths(today, 3), "yyyy-MM-dd")) return "last3months";
    if (target === format(subYears(today, 1), "yyyy-MM-dd")) return "lastyear";

    return "";
  }, [filters.date]);

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

      <Dropdown
        fluid
        selection
        clearable
        className={clsx(styles.input, styles.small)}
        placeholder="Date"
        options={dateOptions}
        value={currentShortcutValue}
        onChange={handleDateChange}
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
      />
    </div>
  );
}

export default SearchBar;