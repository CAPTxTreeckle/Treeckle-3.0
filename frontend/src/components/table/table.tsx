import { Dispatch, Key, SetStateAction, useMemo } from "react";
import BaseTable, {
  TableComponents,
  BaseTableProps,
  SortOrder,
} from "react-base-table";
import clsx from "clsx";
import { Icon } from "semantic-ui-react";
import { SortBy } from "../../custom-hooks/use-table-state";
import styles from "./table.module.scss";
import "react-base-table/styles.css";

export type TableProps<T> = BaseTableProps<T> & {
  setSortBy?: Dispatch<SetStateAction<SortBy | undefined>>;
};

const tableComponents: TableComponents = {
  // eslint-disable-next-line react/prop-types
  SortIndicator: ({ sortOrder, className }) => (
    <div className={className}>
      <Icon name={sortOrder === "asc" ? "caret up" : "caret down"} />
    </div>
  ),
  // eslint-disable-next-line react/prop-types
  ExpandIcon: ({ expandable, expanded, onExpand }) => {
    if (!expandable) {
      return null;
    }

    return (
      <Icon
        link
        className={clsx(styles.expandIcon, expanded && styles.expanded)}
        name="plus circle"
        onClick={() => onExpand(!expanded)}
        fitted
      />
    );
  },
};

function Table<T>({
  setSortBy,
  className,
  rowClassName,
  components,
  ...props
}: TableProps<T>) {
  const onColumnSort = useMemo(
    () =>
      setSortBy
        ? ({ key, order }: { key: Key; order: SortOrder }) =>
            setSortBy((sortBy) =>
              sortBy?.key === key && sortBy?.order === "desc"
                ? undefined
                : {
                    key,
                    order,
                  },
            )
        : undefined,
    [setSortBy],
  );

  return (
    <BaseTable<T>
      onColumnSort={onColumnSort}
      {...props}
      className={clsx(styles.table, styles.important, className)}
      rowClassName={(props) =>
        clsx(
          styles.row,
          !rowClassName || typeof rowClassName === "string"
            ? rowClassName
            : rowClassName(props),
        )
      }
      components={{ ...tableComponents, ...components }}
    />
  );
}

export default Table;
