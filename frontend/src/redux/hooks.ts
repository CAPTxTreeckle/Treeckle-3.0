import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import isEqual from "lodash/isEqual";
import { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDeepEqualSelector: TypedUseSelectorHook<RootState> = (
  selector,
) => useAppSelector(selector, isEqual);
