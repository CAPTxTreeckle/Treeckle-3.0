import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import useAxios, { Options, RefetchOptions, ResponseValues } from "axios-hooks";
import { useCallback, useMemo, useState } from "react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  useGoogleLogin as useGoogleLoginClient,
} from "react-google-login";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserTokens,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import {
  AuthenticationData,
  CheckAccountPostData,
  FacebookLoginPostData,
  GoogleLoginPostData,
  LoginDetails,
  PasswordLoginPostData,
  PasswordResetPostData,
  TokenRefreshPostData,
} from "../../types/auth";
import {
  errorHandlerWrapper,
  EXPIRED_SESSION_MSG,
  isForbiddenOrNotAuthenticated,
} from "../../utils/error-utils";

export function useAxiosWithTokenRefresh<TResponse, TBody = undefined>(
  config: AxiosRequestConfig,
  options?: Options,
): [
  ResponseValues<TResponse, TBody, Error>,
  (
    config?: AxiosRequestConfig<TBody>,
    options?: RefetchOptions,
  ) => AxiosPromise<TResponse>,
  () => void,
] {
  const { access, refresh } = useAppSelector(selectCurrentUserTokens) ?? {};
  const dispatch = useAppDispatch();
  const [responseValues, apiCall, cancel] = useAxios<TResponse, TBody, Error>(
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
  const [, tokenRefresh] = useAxios<
    AuthenticationData,
    Partial<TokenRefreshPostData>
  >(
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
      config?: AxiosRequestConfig<TBody>,
      options?: RefetchOptions,
    ): Promise<AxiosResponse<TResponse>> => {
      try {
        setLoading(true);
        const response = await apiCall(config, options);
        return response;
      } catch (error) {
        if (!isForbiddenOrNotAuthenticated(error)) {
          throw error;
        }

        try {
          console.log("Error before token refresh:", error);

          const { data: authData } = await tokenRefresh();

          console.log("POST /gateway/refresh success:", authData);

          const response = await apiCall(
            {
              ...config,
              headers: { authorization: `Bearer ${authData.tokens.access}` },
            },
            options,
          );

          dispatch(updateCurrentUserAction(authData));

          return response;
        } catch (error) {
          console.log("Error after token refresh:", error);

          if (isForbiddenOrNotAuthenticated(error)) {
            throw new Error(EXPIRED_SESSION_MSG);
          }

          throw error;
        }
      } finally {
        setLoading(false);
      }
    },
    [apiCall, tokenRefresh, dispatch],
  );

  return [{ ...responseValues, loading }, apiCallWithTokenRefresh, cancel];
}

interface GoogleFailureResponse {
  error: string;
  details?: string;
  response?: unknown;
}

export function useGoogleAuth(
  callback: (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => void,
) {
  const [isAvailable, setAvailable] = useState(true);

  const { signIn, loaded } = useGoogleLoginClient({
    clientId: (import.meta.env.VITE_APP_GOOGLE_CLIENT_ID as string) ?? "",
    cookiePolicy: "single_host_origin",
    onSuccess: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
      console.log("Google Client login success:", response);

      callback(response);
    },
    onFailure: (error: GoogleFailureResponse) => {
      console.log("Google Client error:", error, error?.response);
      if (error?.error === "idpiframe_initialization_failed") {
        setAvailable(false);
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
    loading: !loaded && isAvailable,
    isAvailable,
  };
}

const isValidResponse = (response: fb.StatusResponse) => {
  const grantedScopes = response?.authResponse?.grantedScopes?.split(",");

  return (
    response.status === "connected" &&
    grantedScopes?.includes("public_profile") &&
    grantedScopes?.includes("email")
  );
};

export function useFacebookAuth(
  callback: (response: fb.StatusResponse) => void,
) {
  const startFacebookAuth = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    window.FB?.getLoginStatus((response: fb.StatusResponse) => {
      console.log("Facebook Client get login status response:", response);

      if (isValidResponse(response)) {
        callback(response);
        return;
      }

      const startFacebookClientLogin = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        window.FB?.login(
          (response: fb.StatusResponse) => {
            console.log("Facebook Client login response:", response);

            if (isValidResponse(response)) {
              callback(response);
              return;
            }

            if (response.status === "not_authorized") {
              toast.error(
                "No permission to access required info from Facebook.",
              );
              return;
            }

            if (
              response.status === "connected" &&
              !response?.authResponse?.grantedScopes
                ?.split(",")
                ?.includes("email")
            ) {
              toast.error("No permission to access email from Facebook.");
            }
          },
          {
            scope: "public_profile,email",
            return_scopes: true,
            auth_type: "rerequest",
          },
        );
      };

      if (response.status === "connected") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        window.FB?.logout(startFacebookClientLogin);
      } else {
        startFacebookClientLogin();
      }
    });
  }, [callback]);

  return { startFacebookAuth };
}

export function useCheckAccount() {
  const [{ loading }, apiCall] = useAxios<LoginDetails, CheckAccountPostData>(
    {
      url: "/gateway/check",
      method: "post",
    },
    { manual: true },
  );

  const checkAccount = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: CheckAccountPostData) => {
          console.log("POST /gateway/check data:", data);

          const { data: loginDetails } = await apiCall({ data });

          console.log("POST /gateway/check success:", loginDetails);

          return loginDetails;
        },
        { logMessageLabel: "POST /gateway/check error:" },
      ),
    [apiCall],
  );

  return { loading, checkAccount };
}

export function usePasswordReset() {
  const [{ loading }, apiCall] = useAxios<LoginDetails, PasswordResetPostData>(
    {
      url: "/gateway/reset",
      method: "post",
    },
    { manual: true },
  );

  const passwordReset = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: PasswordResetPostData) => {
          console.log("POST /gateway/reset data:", data);

          const { data: loginDetails } = await apiCall({ data });

          console.log("POST /gateway/reset success:", loginDetails);

          return loginDetails;
        },
        { logMessageLabel: "POST /gateway/reset error:" },
      ),
    [apiCall],
  );

  return { loading, passwordReset };
}

export function useGoogleLogin() {
  const [{ loading }, apiCall] = useAxios<
    AuthenticationData,
    GoogleLoginPostData
  >(
    {
      url: "/gateway/google",
      method: "post",
    },
    { manual: true },
  );

  const googleLogin = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: GoogleLoginPostData) => {
          console.log("POST /gateway/google data:", data);

          const { data: authData } = await apiCall({ data });

          console.log("POST /gateway/google success:", authData);

          return authData;
        },
        { logMessageLabel: "POST /gateway/google error:" },
      ),
    [apiCall],
  );

  return { loading, googleLogin };
}

export function useFacebookLogin() {
  const [{ loading }, apiCall] = useAxios<
    AuthenticationData,
    FacebookLoginPostData
  >(
    {
      url: "/gateway/facebook",
      method: "post",
    },
    { manual: true },
  );

  const facebookLogin = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: FacebookLoginPostData) => {
          console.log("POST /gateway/facebook data:", data);

          const { data: authData } = await apiCall({ data });

          console.log("POST /gateway/facebook success:", authData);

          return authData;
        },
        { logMessageLabel: "POST /gateway/facebook error:" },
      ),
    [apiCall],
  );

  return { loading, facebookLogin };
}

export function usePasswordLogin() {
  const [{ loading }, login] = useAxios<
    AuthenticationData,
    PasswordLoginPostData
  >(
    {
      url: "/gateway/login",
      method: "post",
    },
    { manual: true },
  );

  const passwordLogin = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: PasswordLoginPostData) => {
          console.log("POST /gateway/login data:", data);

          const { data: authData } = await login({ data });

          console.log("POST /gateway/login success:", authData);

          return authData;
        },
        { logMessageLabel: "POST /gateway/login error:" },
      ),

    [login],
  );

  return { loading, passwordLogin };
}
