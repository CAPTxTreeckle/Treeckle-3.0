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

export default function useTableState<T>(
  data: T[],
  { defaultSortBy }: TableStateOptions = {},
) {
  const [sortBy, setSortBy] = useState<SortBy | undefined>(defaultSortBy);
  const [activeFilters, setFilters] = useState<Filters>({
    title: "",
    venue: "",
    date: "",
  });

  const onFilterChange = useMemo(
    () => throttle(setFilters, 500),
    [],
  );

  const filteredData = useMemo(() => {
    const { title, venue, date } = activeFilters;

    if (
        data.length === 0 || 
        (!title && !venue && !date)
    ) {
      return data;
    }

    const formattedDate = date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
    
    return data.filter((item: any) => {
      const titleMatch =
        !title ||
        (item.title &&
          item.title.toLowerCase().includes(title.toLowerCase()));

      const venueMatch =
        !venue ||
        (item.venue?.name &&
          item.venue.name.toLowerCase().includes(venue.toLowerCase()));

      const dateMatch =
        !date ||
        (item.eventDateString && item.eventDateString.includes(formattedDate));

      return titleMatch && venueMatch && dateMatch;
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
