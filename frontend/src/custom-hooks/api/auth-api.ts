import { useCallback, useState } from "react";
import useAxios, { Options, RefetchOptions, ResponseValues } from "axios-hooks";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  useGoogleLogin,
} from "react-google-login";
import { toast } from "react-toastify";
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from "axios";
import { AuthenticationData } from "../../types/auth";
import { isForbiddenOrNotAuthenticated } from "../../utils/error-utils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  setCurrentUserAction,
  selectCurrentUser,
} from "../../redux/slices/current-user-slice";
import { resetReduxState } from "../../redux/store";

export function useAxiosWithTokenRefresh<T>(
  config: AxiosRequestConfig,
  options?: Options,
): [
  ResponseValues<T, Error>,
  (config?: AxiosRequestConfig, options?: RefetchOptions) => AxiosPromise<T>,
  () => void,
] {
  const { access, refresh } = useAppSelector(selectCurrentUser) ?? {};
  const dispatch = useAppDispatch();
  const [responseValues, apiCall, cancel] = useAxios<T>(
    {
      ...config,
      headers: {
        ...config?.headers,
        authorization: `Bearer ${access}`,
      },
    },
    {
      ...options,
      manual: true,
    },
  );
  const [, tokenRefresh] = useAxios<AuthenticationData>(
    {
      url: "/gateway/refresh",
      method: "post",
      data: { refresh },
    },
    { manual: true },
  );
  const [loading, setLoading] = useState(false);

  const apiCallWithTokenRefresh = useCallback(
    async (
      config?: AxiosRequestConfig,
      options?: RefetchOptions,
    ): Promise<AxiosResponse<T>> => {
      try {
        setLoading(true);
        const response = await apiCall(config, options);
        return response;
      } catch (error) {
        if (!isForbiddenOrNotAuthenticated(error)) {
          throw error;
        }

        try {
          console.log("Error before token refresh:", error, error?.response);

          const { data } = await tokenRefresh();

          console.log("POST /gateway/refresh success:", data);

          const response = await apiCall(
            {
              ...config,
              headers: { authorization: `Bearer ${data.access}` },
            },
            options,
          );

          dispatch(setCurrentUserAction(data));

          return response;
        } catch (error) {
          console.log("Error after token refresh:", error, error?.response);
          if (isForbiddenOrNotAuthenticated(error)) {
            // kick user out
            resetReduxState();
            throw new Error(
              "Your current session has expired. Please log in again.",
            );
          } else {
            throw error;
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [apiCall, tokenRefresh, dispatch],
  );

  return [{ ...responseValues, loading }, apiCallWithTokenRefresh, cancel];
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();
  const [{ loading }, login] = useAxios<AuthenticationData>(
    {
      url: "/gateway/gmail",
      method: "post",
    },
    { manual: true },
  );
  const [isUnavailable, setUnavailable] = useState(false);

  const { signIn, loaded } = useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "",
    cookiePolicy: "single_host_origin",
    onSuccess: async (
      response: GoogleLoginResponse | GoogleLoginResponseOffline,
    ) => {
      try {
        const { tokenId } = response as GoogleLoginResponse;
        const { data } = await login({ data: { tokenId } });
        console.log("POST /gateway/gmail success:", data);

        toast.success("Signed in successfully.");

        dispatch(setCurrentUserAction(data));
      } catch (error) {
        console.log("POST /gateway/gmail error:", error, error?.response);
        toast.error("Invalid user.");
      }
    },
    onFailure: (error) => {
      console.log("Google Client error:", error, error?.response);
      if (error?.error === "idpiframe_initialization_failed") {
        setUnavailable(true);
      } else if (error?.error === "popup_closed_by_user") {
        return;
      }

      toast.error(
        error?.details || error?.error || "An unknown error has occurred.",
      );
    },
  });

  return {
    startGoogleAuth: signIn,
    loading: !loaded || loading,
    isUnavailable,
  };
}
