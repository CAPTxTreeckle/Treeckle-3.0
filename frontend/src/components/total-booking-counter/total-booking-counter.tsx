import { useEffect, memo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Icon } from "semantic-ui-react";
import { useCountUp } from "react-countup";
import { useGetTotalBookingCount } from "../../custom-hooks/api/bookings-api";

const CounterViewer = ({
  totalBookingCount,
}: {
  totalBookingCount: number;
}) => {
  const countUpRef = useRef<HTMLSpanElement | null>(null);
  const { ref, inView } = useInView({ delay: 250 });
  const { start, reset } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: totalBookingCount,
    duration: 2,
  });

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
        <CounterViewer totalBookingCount={totalBookingCount} />
      )}
    </div>
  );
}

export default memo(TotalBookingCounter);
