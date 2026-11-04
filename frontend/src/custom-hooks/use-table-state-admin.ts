import { Key, useMemo, useState } from "react";
import { SortOrder } from "react-base-table";

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
  const processedData = useMemo(() => {
    return sortBy
      ? sort(data, {
          props: `${sortBy.key}`,
          reverse: sortBy.order === "desc",
        })
      : data;
  }, [data, sortBy]);

  return { processedData, sortBy, setSortBy };
}
