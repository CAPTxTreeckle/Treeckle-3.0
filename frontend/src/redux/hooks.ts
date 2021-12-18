import equal from "fast-deep-equal";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useDeepEqualAppSelector: TypedUseSelectorHook<RootState> = (
  selector,
) => useAppSelector(selector, equal);
