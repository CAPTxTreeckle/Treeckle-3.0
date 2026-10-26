import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Loader, Popup, Segment } from "semantic-ui-react";

import HorizontalLayoutContainer from "../../components/horizontal-layout-container";
import ResponsiveSelectorMenu from "../../components/responsive-selector-menu";
import Tab, { TabOption } from "../../components/tab";
import { useGetBookingAnalytics } from "../../custom-hooks/api/bookings-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import {
  BookingAnalyticsData,
  BookingAnalyticsDirection,
  VenueBookingAnalytics,
} from "../../types/bookings";
import styles from "./admin-analytics-page.module.scss";

const PERIOD_OPTIONS = [
  { name: "1 Day", value: 1 },
  { name: "1 Week", value: 7 },
  { name: "2 Weeks", value: 14 },
  { name: "1 Month", value: 30 },
  { name: "3 Months", value: 90 },
  { name: "6 Months", value: 180 },
  { name: "1 Year", value: 365 },
  { name: "2 Years", value: 730 },
  { name: "3 Years", value: 1095 },
  { name: "5 Years", value: 1825 },
] as const;

const STATUS_STACKS = [
  { key: "approvedCount", label: "Approved", color: "#21ba45" },
  { key: "pendingCount", label: "Pending", color: "#fbbd08" },
  { key: "rejectedCount", label: "Rejected", color: "#db2828" },
  { key: "cancelledCount", label: "Cancelled", color: "#767676" },
] as const;

function venueTotal(venue: VenueBookingAnalytics) {
  return STATUS_STACKS.reduce((total, { key }) => total + venue[key], 0);
}

type ChartProps = {
  analytics?: BookingAnalyticsData;
  loading: boolean;
  periodDays: 1 | 7 | 14 | 30 | 90 | 180 | 365 | 730 | 1095 | 1825;
  onPeriodChange: (
    periodDays: 1 | 7 | 14 | 30 | 90 | 180 | 365 | 730 | 1095 | 1825,
  ) => void;
};

function AnalyticsChart({
  analytics,
  loading,
  periodDays,
  onPeriodChange,
}: ChartProps) {
  const totalBookings = useMemo(
    () =>
      analytics?.venueBreakdown.reduce(
        (total, venue) => total + venueTotal(venue),
        0,
      ) ?? 0,
    [analytics],
  );
  const chartData = useMemo(
    () =>
      analytics?.venueBreakdown.map((venue) => ({
        ...venue,
        total: venueTotal(venue),
      })) ?? [],
    [analytics],
  );

  return (
    <>
      <ResponsiveSelectorMenu
        dropdownOnly
        options={PERIOD_OPTIONS.map(({ name }) => ({ name }))}
        activeIndex={PERIOD_OPTIONS.findIndex(({ value }) => value === periodDays)}
        onChange={(index) => onPeriodChange(PERIOD_OPTIONS[index]?.value ?? 30)}
      />

      {loading && !analytics ? (
        <Loader active inline="centered" />
      ) : (
        <>
          <Segment className={styles.chartSegment}>
            <div className={styles.chartHeader}>
              <h2>Venue Bookings</h2>
              <span>Total bookings: {totalBookings}</span>
            </div>

            {chartData.length ? (
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 16, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="venueName"
                      interval={0}
                      tick={{ fill: "#1b1c1d" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: "#1b1c1d" }} />
                    <Tooltip
                      contentStyle={{ color: "#1b1c1d" }}
                      labelStyle={{ color: "#1b1c1d" }}
                    />
                    <Legend wrapperStyle={{ color: "#1b1c1d" }} />
                    {STATUS_STACKS.map(({ key, label, color }) => (
                      <Bar
                        dataKey={key}
                        fill={color}
                        key={key}
                        name={label}
                        stackId="bookings"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyMessage}>No bookings in this period.</p>
            )}
          </Segment>

          <Segment className={styles.adoptionSegment}>
            <div className={styles.chartHeader}>
              <h2>Booking Frequency</h2>
              <span>Unique bookers: {analytics?.uniqueBookers ?? 0}</span>
            </div>

            {analytics?.uniqueBookers ? (
              <div className={styles.frequencyChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.bookerFrequency}
                    margin={{ top: 16, right: 16, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fill: "#1b1c1d" }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#1b1c1d" }} />
                    <Tooltip
                      contentStyle={{ color: "#1b1c1d" }}
                      labelStyle={{ color: "#1b1c1d" }}
                    />
                    <Bar dataKey="count" fill="#2185d0" name="Bookers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyMessage}>No bookings in this period.</p>
            )}
          </Segment>
        </>
      )}
    </>
  );
}

function AdminAnalyticsPage() {
  const [direction, setDirection] = useState<BookingAnalyticsDirection>("past");
  const [periodDays, setPeriodDays] = useState<
    1 | 7 | 14 | 30 | 90 | 180 | 365 | 730 | 1095 | 1825
  >(30);
  const [analytics, setAnalytics] = useState<BookingAnalyticsData>();
  const { getBookingAnalytics, loading } = useGetBookingAnalytics();

  useScrollToTop();

  const refresh = useCallback(async () => {
    const data = await getBookingAnalytics({ direction, periodDays });
    if (data) setAnalytics(data);
  }, [direction, getBookingAnalytics, periodDays]);

  useEffect(() => {
    refresh().catch((error) => console.error(error));
  }, [refresh]);

  const chartProps = {
    analytics,
    loading,
    periodDays,
    onPeriodChange: setPeriodDays,
  };
  const tabs: TabOption[] = [
    { name: "Past", pane: <AnalyticsChart {...chartProps} /> },
    { name: "Future", pane: <AnalyticsChart {...chartProps} /> },
  ];

  return (
    <>
      <h1>
        <HorizontalLayoutContainer align="center">
          <span>Booking Analytics</span>
          <Popup
            content="Refresh"
            position="top center"
            hideOnScroll
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={() => {
                  void refresh().catch((error) => console.error(error));
                }}
                loading={loading}
                disabled={loading}
              />
            }
          />
        </HorizontalLayoutContainer>
      </h1>

      <Tab
        activeIndex={direction === "past" ? 0 : 1}
        onChange={(index) => setDirection(index === 0 ? "past" : "future")}
        options={tabs}
        showTitle={false}
      />
    </>
  );
}

export default AdminAnalyticsPage;
