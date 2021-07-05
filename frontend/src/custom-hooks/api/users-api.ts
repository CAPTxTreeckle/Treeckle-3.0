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

export function useGetUserInvites() {
  const [{ data: userInvites = DEFAULT_ARRAY, loading }, apiCall] =
    useAxiosWithTokenRefresh<UserInviteData[]>(
      {
        url: "/users/invite",
        method: "get",
      },
      { manual: true },
    );

  const getUserInvites = useCallback(async () => {
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

  return { userInvites, loading, getUserInvites };
}

export function useCreateUserInvites() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<UserInviteData[]>(
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
    loading,
    createUserInvites,
  };
}

export function useUpdateUserInvite() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<UserInviteData>(
    {
      method: "patch",
    },
    { manual: true },
  );

  const updateUserInvite = useMemo(
    () =>
      errorHandlerWrapper(
        async (userInviteId: number | string, data: UserInvitePatchData) => {
          const url = `/users/invite/${userInviteId}`;

          const { data: updatedUserInvite } = await apiCall({
            url,
            data,
          });
          console.log(`PATCH ${url} success:`, updatedUserInvite);

          return updatedUserInvite;
        },
        "PATCH /users/invite/:userInviteId error:",
      ),
    [apiCall],
  );

  return { loading, updateUserInvite };
}

export function useDeleteUserInvite() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<UserInviteData>(
    {
      method: "delete",
    },
    { manual: true },
  );

  const deleteUserInvite = useMemo(
    () =>
      errorHandlerWrapper(async (userInviteId: number | string) => {
        const url = `/users/invite/${userInviteId}`;

        const { data: deletedUserInvite } = await apiCall({
          url,
        });

        console.log(`DELETE ${url} success:`, deletedUserInvite);

        return deletedUserInvite;
      }, "DELETE /users/invite/:userInviteId error:"),
    [apiCall],
  );

  return { loading, deleteUserInvite };
}

export function useGetUsers() {
  const [{ data: users = DEFAULT_ARRAY, loading }, apiCall] =
    useAxiosWithTokenRefresh<UserData[]>(
      {
        url: "/users/",
        method: "get",
      },
      { manual: true },
    );

  const getUsers = useCallback(async () => {
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

  return { users, loading, getUsers };
}

export function useGetSingleUser() {
  const [{ data: user, loading }, apiCall] = useAxiosWithTokenRefresh<UserData>(
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

  return { user, loading, getSingleUser };
}

export function useUpdateUser() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<UserData>(
    {
      method: "patch",
    },
    { manual: true },
  );

  const updateUser = useMemo(
    () =>
      errorHandlerWrapper(
        async (userId: number | string, data: UserPatchData) => {
          const url = `/users/${userId}`;

          const { data: updatedUser } = await apiCall({
            url,
            data,
          });
          console.log(`PATCH ${url} success:`, updatedUser);

          return updatedUser;
        },
        "PATCH /users/:userId error:",
      ),
    [apiCall],
  );

  return { loading, updateUser };
}

export function useDeleteUser() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<UserData>(
    {
      url: "/users/",
      method: "delete",
    },
    { manual: true },
  );

  const deleteUser = useMemo(
    () =>
      errorHandlerWrapper(async (userId: number | string) => {
        const url = `/users/${userId}`;

        const { data: deletedUser } = await apiCall({
          url,
        });

        console.log(`DELETE ${url} success:`, deletedUser);

        return deletedUser;
      }, "DELETE /users/:userId error:"),
    [apiCall],
  );

  return { loading, deleteUser };
}
