import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import throttle from "lodash/throttle";
import { Key, useMemo, useState } from "react";
import { SortOrder } from "react-base-table";
import { Filters } from "../components/admin-search-bar/admin-search-bar";

import { sort } from "../utils/transform-utils";

export type SortBy = {
  key: Key;
  order: SortOrder;
};

export type TableStateOptions = {
  defaultSortBy?: SortBy;
};

interface FilterableItem {
  title?: string;
  venue?: {
    name?: string;
  } | null;
  eventDateString?: string;
  startDateTime?: number | string;
  status?: string;
}

export default function useTableState<T extends FilterableItem>(
  data: T[],
  { defaultSortBy }: TableStateOptions = {},
) {
  const [sortBy, setSortBy] = useState<SortBy | undefined>(defaultSortBy);
  const [activeFilters, setFilters] = useState<Filters>({
    title: "",
    venue: "",
    date: "",
    status: ""
  });

  const onFilterChange = useMemo(
    () => throttle(setFilters, 500),
    [],
  );

  const filteredData = useMemo(() => {
    const { title, venue, date, status } = activeFilters;
    if (
        data.length === 0 || 
        (!title && !venue && !date && !status)
    ) {
      return data;
    }

    return data.filter((datum) => {
      const item = datum;

      const titleMatch =
        !title ||
        (item.title &&
          item.title.toLowerCase().includes(title.toLowerCase()));

      const venueMatch =
        !venue ||
        (item.venue?.name &&
          item.venue.name.toLowerCase().includes(venue.toLowerCase()));

      const dateMatch = (() => {
        if (!date) {
          return true;
        }

        if (!item.startDateTime) {
          return false;
        }

        const filterDate = parseISO(date);
        const today = new Date();
        const start = startOfDay(filterDate < today ? filterDate : today);
        const end = endOfDay(filterDate > today ? filterDate : today);

        return isWithinInterval(new Date(item.startDateTime), { start, end });
      })();

      const statusMatch =
        !status ||
        (item.status &&
          item.status.toLowerCase() === status.toLowerCase());

      return titleMatch && venueMatch && dateMatch && statusMatch;
    });
  }, [data, activeFilters]);

  // filtered + sorted data
  const processedData = useMemo(() => {
    return sortBy
      ? sort(filteredData, {
          props: `${sortBy.key}`,
          reverse: sortBy.order === "desc",
        })
      : filteredData;
  }, [filteredData, sortBy]);

  return { processedData, sortBy, setSortBy, onFilterChange };
}
