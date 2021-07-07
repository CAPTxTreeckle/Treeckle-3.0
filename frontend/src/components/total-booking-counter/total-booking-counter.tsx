import { useEffect, MutableRefObject, memo } from "react";
import { useInView } from "react-intersection-observer";
import { Loader } from "semantic-ui-react";
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

  useEffect(() => {
    getTotalBookingCount();
  }, [getTotalBookingCount]);

  return loading ? (
    <Loader active inline size="medium" />
  ) : (
    <CountUp start={0} end={totalBookingCount} duration={4}>
      {({ countUpRef, start, reset }) => (
        <CounterViewer start={start} reset={reset} countUpRef={countUpRef} />
      )}
    </CountUp>
  );
}

export default memo(TotalBookingCounter);
