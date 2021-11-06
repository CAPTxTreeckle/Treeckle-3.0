import { useCallback, useMemo, useState } from "react";
import useAxios, { Options, RefetchOptions, ResponseValues } from "axios-hooks";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  useGoogleLogin as useGoogleLoginClient,
} from "react-google-login";
import { toast } from "react-toastify";
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from "axios";
import {
  AuthenticationData,
  CheckAccountPostData,
  FacebookLoginPostData,
  GoogleLoginPostData,
  LoginDetails,
  PasswordLoginPostData,
  TokenRefreshPostData,
} from "../../types/auth";
import {
  errorHandlerWrapper,
  isForbiddenOrNotAuthenticated,
} from "../../utils/error-utils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  updateCurrentUserAction,
  selectCurrentUserTokens,
} from "../../redux/slices/current-user-slice";
import { resetAppState } from "../../redux/store";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (!isForbiddenOrNotAuthenticated(error)) {
          throw error;
        }

        try {
          console.log("Error before token refresh:", error, error?.response);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.log("Error after token refresh:", error, error?.response);
          if (isForbiddenOrNotAuthenticated(error)) {
            // kick user out
            resetAppState();
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

export function useGoogleAuth(
  callback: (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => void,
) {
  const [isAvailable, setAvailable] = useState(true);

  const { signIn, loaded } = useGoogleLoginClient({
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "",
    cookiePolicy: "single_host_origin",
    onSuccess: async (
      response: GoogleLoginResponse | GoogleLoginResponseOffline,
    ) => {
      console.log("Google Client login success:", response);

      callback(response);
    },
    onFailure: (error) => {
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
    window.FB?.getLoginStatus((response) => {
      console.log("Facebook Client get login status response:", response);

      if (isValidResponse(response)) {
        callback(response);
        return;
      }

      const startfacebookClientLogin = () =>
        window.FB?.login(
          (response) => {
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

      if (response.status === "connected") {
        window.FB?.logout(startfacebookClientLogin);
      } else {
        startfacebookClientLogin();
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
