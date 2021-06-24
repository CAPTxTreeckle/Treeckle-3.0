import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import {
  BookingCreationStep,
  CustomVenueBookingFormData,
} from "../../types/bookings";
import { VenueViewProps } from "../../types/venues";
import type { RootState } from "../store";

type BookingCreationState = {
  currentCreationStep: BookingCreationStep;
  selectedCategory: string | null;
  selectedVenue: VenueViewProps | null;
  bookingTitle: string | null;
  bookingFormData: CustomVenueBookingFormData[] | null;
};

const initialState: BookingCreationState = {
  currentCreationStep: BookingCreationStep.Category,
  selectedCategory: null,
  selectedVenue: null,
  bookingTitle: null,
  bookingFormData: null,
} as BookingCreationState;

export const bookingCreationSlice = createSlice({
  name: "bookingCreation",
  initialState,
  reducers: {
    resetBookingCreationAction: () => initialState,
    chooseVenueCategoryAction: (state, { payload }: PayloadAction<string>) => {
      state.selectedCategory = payload;
      state.currentCreationStep = BookingCreationStep.Venue;
    },
    chooseVenueAction: (state, { payload }: PayloadAction<VenueViewProps>) => {
      state.selectedVenue = payload;
      state.currentCreationStep = BookingCreationStep.TimeSlot;
    },
    backFromVenueSelectionAction: (state) => {
      state.selectedCategory = null;
      state.currentCreationStep = BookingCreationStep.Category;
    },
  },
});

// action creators
export const {
  resetBookingCreationAction,
  chooseVenueCategoryAction,
  chooseVenueAction,
  backFromVenueSelectionAction,
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

export default bookingCreationSlice.reducer;
