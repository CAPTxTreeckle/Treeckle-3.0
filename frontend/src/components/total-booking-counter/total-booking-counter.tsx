import { memo, useEffect, useRef, useState } from "react";
import { useCountUp } from "react-countup";
import { useInView } from "react-intersection-observer";
import { Icon } from "semantic-ui-react";

import { useGetTotalBookingCount } from "../../custom-hooks/api/bookings-api";

const CounterViewer = ({
  totalBookingCount,
}: {
  totalBookingCount: number;
}) => {
  const countUpRef = useRef<HTMLSpanElement | null>(null);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ delay: 250 });
  const { start, reset } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: totalBookingCount,
    duration: 2,
    onStart: () => setLoading(true),
    onEnd: () => setLoading(false),
  });

  useEffect(() => {
    if (inView) {
      start();
    } else {
      reset();
      setLoading(false);
    }
  }, [inView, start, reset]);

  return (
    <span
      ref={(element) => {
        countUpRef.current = element;
        ref(element);
      }}
      aria-busy={loading}
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
