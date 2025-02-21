declare namespace fb {
  interface StatusResponse {
    status: "connected" | "not_authorized" | "unknown";
    authResponse?: {
      accessToken: string;
      expiresIn: number;
      signedRequest: string;
      userID: string;
      grantedScopes?: string;
    };
  }
}

interface Window {
  FB: typeof import("facebook-js-sdk");
}
