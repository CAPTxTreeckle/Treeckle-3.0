import { Key, useMemo, useState } from "react";
import { SortOrder } from "react-base-table";
import throttle from "lodash/throttle";
import { generateSearchEngine } from "../utils/search-utils";
import { sort } from "../utils/parser-utils";

export type SortBy = {
  key: Key;
  order: SortOrder;
};

export type TableStateOptions = {
  defaultSortBy?: SortBy;
  searchKeys?: string[];
};

export default function useTableState<T>(
  data: T[],
  { defaultSortBy, searchKeys }: TableStateOptions = {},
) {
  const [sortBy, setSortBy] = useState<SortBy | undefined>(defaultSortBy);
  const [activeSearchValue, setActiveSearchValue] = useState("");

  const searchEngine = useMemo(
    () =>
      generateSearchEngine(data, {
        minMatchCharLength: 2,
        keys: searchKeys,
        threshold: 0,
        ignoreLocation: true,
      }),
    [data, searchKeys],
  );

  const onSearchValueChange = useMemo(
    () => throttle(setActiveSearchValue, 500),
    [],
  );

  const filteredData = useMemo(() => {
    const filter = (data: T[]) => {
      if (
        activeSearchValue.length < 2 ||
        !searchKeys ||
        searchKeys.length === 0 ||
        data.length === 0
      ) {
        return data;
      }

      return searchEngine.search(activeSearchValue).map(({ item }) => item);
    };

    return filter(data);
  }, [searchEngine, data, searchKeys, activeSearchValue]);

  // filtered + sorted data
  const processedData = useMemo(() => {
    return sortBy
      ? sort(filteredData, {
          props: `${sortBy.key}`,
          reverse: sortBy.order === "desc",
        })
      : filteredData;
  }, [filteredData, sortBy]);

  return { processedData, sortBy, setSortBy, onSearchValueChange };
}
