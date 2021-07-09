import { useEffect, MutableRefObject, memo } from "react";
import { useInView } from "react-intersection-observer";
import { Icon } from "semantic-ui-react";
import CountUp from "react-countup";
import { useGetTotalBookingCount } from "../../custom-hooks/api/bookings-api";

const CounterViewer = ({
  start,
  reset,
  countUpRef,
}: {
  start?: () => void;
  reset?: () => void;
  countUpRef: MutableRefObject<unknown>;
}) => {
  const { ref, inView } = useInView({ delay: 250 });

  useEffect(() => {
    inView ? start?.() : reset?.();
  }, [inView, start, reset]);

  return (
    <span
      ref={(element) => {
        countUpRef.current = element;
        ref(element);
      }}
    />
  );
};

function TotalBookingCounter() {
  const { totalBookingCount, loading, getTotalBookingCount } =
    useGetTotalBookingCount();
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      getTotalBookingCount();
    }
  }, [inView, getTotalBookingCount]);

  return (
    <div ref={ref}>
      {loading ? (
        <Icon name="spinner" loading fitted />
      ) : (
        <CountUp start={0} end={totalBookingCount} duration={4}>
          {({ countUpRef, start, reset }) => (
            <CounterViewer
              start={start}
              reset={reset}
              countUpRef={countUpRef}
            />
          )}
        </CountUp>
      )}
    </div>
  );
}

export default memo(TotalBookingCounter);
