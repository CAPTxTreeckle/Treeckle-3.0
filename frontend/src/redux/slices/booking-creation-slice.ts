import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import equal from "fast-deep-equal";

import {
  BookingCreationStep,
  BookingData,
  BookingFormProps,
  DateTimeRange,
} from "../../types/bookings";
import { FieldType, VenueViewProps } from "../../types/venues";
import type { RootState } from "../store";

export type BookingCreationState = {
  currentCreationStep: BookingCreationStep;
  selectedCategory: string | null;
  selectedVenue: VenueViewProps | null;
  newBookingPeriods: DateTimeRange[] | null;
  bookingFormProps: BookingFormProps | null;
  createdBookings: BookingData[] | null;
};

const initialState: BookingCreationState = {
  currentCreationStep: BookingCreationStep.Category,
  selectedCategory: null,
  selectedVenue: null,
  newBookingPeriods: null,
  bookingFormProps: null,
  createdBookings: null,
} as BookingCreationState;

const bookingCreationSlice = createSlice({
  name: "bookingCreation",
  initialState,
  reducers: {
    resetBookingCreationAction: () => initialState,
    exitBookingFinalizationAction: (state) => {
      if (state.createdBookings) {
        return initialState;
      }

      if (state.currentCreationStep === BookingCreationStep.Finalize) {
        state.currentCreationStep = BookingCreationStep.Form;
      }
    },
    chooseVenueCategoryAction: (_, { payload }: PayloadAction<string>) => {
      if (!payload) {
        return;
      }

      return {
        ...initialState,
        currentCreationStep: BookingCreationStep.Venue,
        selectedCategory: payload,
      };
    },
    chooseVenueAction: (
      { selectedCategory },
      { payload }: PayloadAction<VenueViewProps>,
    ) => ({
      ...initialState,
      currentCreationStep: BookingCreationStep.TimeSlot,
      selectedCategory,
      selectedVenue: payload,
    }),
    updateBookingPeriodsAction: (
      state,
      { payload }: PayloadAction<DateTimeRange[]>,
    ) => {
      state.newBookingPeriods = payload;
    },
    confirmBookingPeriodsAction: (state) => {
      if (!state.newBookingPeriods || state.newBookingPeriods.length === 0) {
        return;
      }

      state.currentCreationStep = BookingCreationStep.Form;
    },
    syncVenueAction: (
      state,
      { payload: selectedVenue }: PayloadAction<VenueViewProps | null>,
    ) => {
      if (!selectedVenue) {
        state.bookingFormProps = null;
        return;
      }

      if (equal(state.selectedVenue, selectedVenue)) {
        state.bookingFormProps = {
          title: state.bookingFormProps?.title ?? "",
          bookingFormResponses:
            selectedVenue?.venueFormProps.bookingFormFields?.map(
              (fields, index) => ({
                ...fields,
                response:
                  state.bookingFormProps?.bookingFormResponses?.[index]
                    ?.response ??
                  (fields.type === FieldType.Boolean ? false : ""),
              }),
            ),
        };

        return;
      }

      state.selectedVenue = selectedVenue;

      state.bookingFormProps = {
        title: "",
        bookingFormResponses:
          selectedVenue?.venueFormProps.bookingFormFields?.map((fields) => ({
            ...fields,
            response: fields.type === FieldType.Boolean ? false : "",
          })),
      };
    },
    completeBookingFormAction: (
      state,
      { payload }: PayloadAction<BookingFormProps>,
    ) => {
      state.currentCreationStep = BookingCreationStep.Finalize;
      state.bookingFormProps = payload;
      state.createdBookings = null;
    },
    successBookingFormSubmissionAction: (
      state,
      { payload }: PayloadAction<BookingData[]>,
    ) => {
      state.createdBookings = payload;
    },
    backFromBookingPeriodsSelectionAction: ({ selectedCategory }) => ({
      ...initialState,
      currentCreationStep: BookingCreationStep.Venue,
      selectedCategory,
    }),
    backFromBookingFormAction: (
      state,
      { payload }: PayloadAction<BookingFormProps>,
    ) => {
      state.currentCreationStep = BookingCreationStep.TimeSlot;
      state.bookingFormProps = payload;
    },
    backFromBookingFinalizationAction: (state) => {
      state.currentCreationStep = BookingCreationStep.Form;
    },
  },
});

// action creators
export const {
  resetBookingCreationAction,
  exitBookingFinalizationAction,
  chooseVenueCategoryAction,
  chooseVenueAction,
  updateBookingPeriodsAction,
  confirmBookingPeriodsAction,
  syncVenueAction,
  completeBookingFormAction,
  successBookingFormSubmissionAction,
  backFromBookingPeriodsSelectionAction,
  backFromBookingFormAction,
  backFromBookingFinalizationAction,
} = bookingCreationSlice.actions;

// selectors
export const selectBookingCreation = ({ bookingCreation }: RootState) =>
  bookingCreation;
export const selectCurrentCreationStep = createSelector(
  selectBookingCreation,
  ({ currentCreationStep }) => currentCreationStep,
);
export const selectSelectedCategory = createSelector(
  selectBookingCreation,
  ({ selectedCategory }) => selectedCategory,
);
export const selectSelectedVenue = createSelector(
  selectBookingCreation,
  ({ selectedVenue }) => selectedVenue,
);
export const selectNewBookingPeriods = createSelector(
  selectBookingCreation,
  ({ newBookingPeriods }) => newBookingPeriods,
);
export const selectBookingFormProps = createSelector(
  selectBookingCreation,
  ({ bookingFormProps }) => bookingFormProps,
);
export const selectCreatedBookings = createSelector(
  selectBookingCreation,
  ({ createdBookings }) => createdBookings,
);

export default bookingCreationSlice.reducer;
