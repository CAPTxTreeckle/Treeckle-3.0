import { ToolbarProps, Navigate, View } from "react-big-calendar";
import { useMediaQuery } from "react-responsive";
import { Button } from "semantic-ui-react";

import styles from "./calendar-toolbar.module.scss";

type Props<T extends Record<string, unknown>> = ToolbarProps<
  T,
  Record<string, unknown>
>;

function CalendarToolbar<T extends Record<string, unknown>>({
  onNavigate,
  onView,
  views,
  view,
  localizer: { messages },
  label,
}: Props<T>) {
  const isTabletOrLarger = useMediaQuery({ query: "(min-width: 768px)" });

  return (
    <div className={styles.calendarToolbar}>
      <Button.Group basic compact>
        <Button
          icon="chevron left"
          onClick={() => onNavigate(Navigate.PREVIOUS)}
        />
        <Button
          content={messages.today}
          onClick={() => onNavigate(Navigate.TODAY)}
        />
        <Button
          icon="chevron right"
          onClick={() => onNavigate(Navigate.NEXT)}
        />
      </Button.Group>

      {isTabletOrLarger && <div className={styles.label}>{label}</div>}

      <Button.Group basic compact>
        {(views as View[]).map((name) => (
          <Button
            key={name}
            active={view === name}
            onClick={() => onView(name)}
          >
            {messages[name]}
          </Button>
        ))}
      </Button.Group>

      {!isTabletOrLarger && <div className={styles.label}>{label}</div>}
    </div>
  );
}

export default CalendarToolbar;
