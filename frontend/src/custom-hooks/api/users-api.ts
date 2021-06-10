import { useCallback, useMemo } from "react";
import { useAxiosWithTokenRefresh } from "./auth-api";
import {
  UserData,
  UserInviteData,
  UserInvitePatchData,
  UserInvitePostData,
  UserPatchData,
} from "../../types/users";
import { errorHandlerWrapper, resolveApiError } from "../../utils/error-utils";
import { DEFAULT_ARRAY } from "../../constants";

export function useGetAllUserInvites() {
  const [{ data: userInvites = DEFAULT_ARRAY, loading: isLoading }, apiCall] =
    useAxiosWithTokenRefresh<UserInviteData[]>(
      {
        url: "/users/invite",
        method: "get",
      },
      { manual: true },
    );

  const getAllUserInvites = useCallback(async () => {
    try {
      return await errorHandlerWrapper(async () => {
        const { data: userInvites = [] } = await apiCall();
        console.log("GET /users/invite success:", userInvites);
        return userInvites;
      }, "GET /users/invite error:")();
    } catch (error) {
      resolveApiError(error);

      return [];
    }
  }, [apiCall]);

  return { userInvites, isLoading, getAllUserInvites };
}

export function useCreateUserInvites() {
  const [{ loading: isLoading }, apiCall] = useAxiosWithTokenRefresh<
    UserInviteData[]
  >(
    {
      url: "/users/invite",
      method: "post",
    },
    { manual: true },
  );

  const createUserInvites = useMemo(
    () =>
      errorHandlerWrapper(async (invitations: UserInvitePostData[]) => {
        const { data: userInvites = [] } = await apiCall({
          data: { invitations },
        });
        console.log("POST /users/invite success:", userInvites);

        if (userInvites.length === 0) {
          throw new Error("No new users were created.");
        }
        return userInvites;
      }, "POST /users/invite error:"),
    [apiCall],
  );

  return {
    isLoading,
    createUserInvites,
  };
}

export function useUpdateUserInvites() {
  const [{ loading: isLoading }, apiCall] = useAxiosWithTokenRefresh<
    UserInviteData[]
  >(
    {
      url: "/users/invite",
      method: "patch",
    },
    { manual: true },
  );

  const updateUserInvites = useMemo(
    () =>
      errorHandlerWrapper(async (users: UserInvitePatchData[]) => {
        const { data: updatedUserInvites = [] } = await apiCall({
          data: { users },
        });
        console.log("PATCH /users/invite success:", updatedUserInvites);

        if (updatedUserInvites.length === 0) {
          throw new Error("No pending registration users were updated.");
        }

        return updatedUserInvites;
      }, "PATCH /users/invite error:"),
    [apiCall],
  );

  return { isLoading, updateUserInvites };
}

export function useDeleteUserInvites() {
  const [{ loading: isLoading }, apiCall] = useAxiosWithTokenRefresh<string[]>(
    {
      url: "/users/invite",
      method: "delete",
    },
    { manual: true },
  );

  const deleteUserInvites = useMemo(
    () =>
      errorHandlerWrapper(async (emails: string[]) => {
        const { data: deletedEmails = [] } = await apiCall({
          data: { emails },
        });

        console.log("DELETE /users/invite success:", deletedEmails);

        if (deletedEmails.length === 0) {
          throw new Error("No pending registration users were deleted.");
        }

        return deletedEmails;
      }, "DELETE /users/invite error:"),
    [apiCall],
  );

  return { isLoading, deleteUserInvites };
}

export function useGetAllUsers() {
  const [{ data: users = DEFAULT_ARRAY, loading: isLoading }, apiCall] =
    useAxiosWithTokenRefresh<UserData[]>(
      {
        url: "/users/",
        method: "get",
      },
      { manual: true },
    );

  const getAllUsers = useCallback(async () => {
    try {
      return await errorHandlerWrapper(async () => {
        const { data: users = [] } = await apiCall();
        console.log("GET /users/ success:", users);
        return users;
      }, "GET /users/ error:")();
    } catch (error) {
      resolveApiError(error);

      return [];
    }
  }, [apiCall]);

  return { users, isLoading, getAllUsers };
}

export function useUpdateUsers() {
  const [{ loading: isLoading }, apiCall] = useAxiosWithTokenRefresh<
    UserData[]
  >(
    {
      url: "/users/",
      method: "patch",
    },
    { manual: true },
  );

  const updateUsers = useMemo(
    () =>
      errorHandlerWrapper(async (users: UserPatchData[]) => {
        const { data: updatedUsers = [] } = await apiCall({
          data: { users },
        });
        console.log("PATCH /users/ success:", updatedUsers);

        if (updatedUsers.length === 0) {
          throw new Error("No existing users were updated.");
        }

        return updatedUsers;
      }, "PATCH /users/ error:"),
    [apiCall],
  );

  return { isLoading, updateUsers };
}

export function useDeleteUsers() {
  const [{ loading: isLoading }, apiCall] = useAxiosWithTokenRefresh<string[]>(
    {
      url: "/users/",
      method: "delete",
    },
    { manual: true },
  );

  const deleteUsers = useMemo(
    () =>
      errorHandlerWrapper(async (emails: string[]) => {
        const { data: deletedEmails = [] } = await apiCall({
          data: { emails },
        });

        console.log("DELETE /users/ success:", deletedEmails);

        if (deletedEmails.length === 0) {
          throw new Error("No existing users were deleted.");
        }

        return deletedEmails;
      }, "DELETE /users/ error:"),
    [apiCall],
  );

  return { isLoading, deleteUsers };
}

export function useGetSingleUser() {
  const [{ data: user, loading: isLoading }, apiCall] =
    useAxiosWithTokenRefresh<UserData>(
      {
        method: "get",
      },
      { manual: true },
    );

  const getSingleUser = useCallback(
    async (userId: number | string) => {
      const url = `/users/${userId}`;

      try {
        return await errorHandlerWrapper(async () => {
          const { data: user } = await apiCall({
            url,
          });
          console.log(`GET ${url} success:`, user);

          return user;
        }, `GET ${url} error:`)();
      } catch (error) {
        resolveApiError(error);
        return undefined;
      }
    },
    [apiCall],
  );

  return { user, isLoading, getSingleUser };
}
