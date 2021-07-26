import { ReactNode } from "react";
import clsx from "clsx";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import styles from "./timeline.module.scss";

export type TimelineElement = {
  content?: ReactNode;
  meta: string;
};

type Props = {
  elements: TimelineElement[];
};

const getThemeColorClassName = (index: number, numElements: number) => {
  if (index === numElements - 1) {
    return styles.greenTheme;
  }

  if (index === 0) {
    return styles.pinkTheme;
  }

  return styles.blueTheme;
};

function Timeline({ elements }: Props) {
  return (
    <VerticalTimeline className={styles.timeline}>
      {elements.map(({ content, meta }, index) => (
        <VerticalTimelineElement
          className={clsx(
            getThemeColorClassName(index, elements.length),
            !content && styles.hidden,
          )}
          key={`${index}-${meta}`}
          date={meta}
          icon={<i className="fas fa-code" />}
        >
          {content}
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>
  );
}

export default Timeline;
