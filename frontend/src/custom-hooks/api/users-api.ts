import { useCallback, useMemo } from "react";

import { DEFAULT_ARRAY } from "../../constants";
import {
  SelfData,
  SelfPatchData,
  SingleUserInvitePostData,
  UserData,
  UserInviteData,
  UserInvitePatchData,
  UserInvitePostData,
  UserPatchData,
} from "../../types/users";
import { errorHandlerWrapper, resolveApiError } from "../../utils/error-utils";
import { useAxiosWithTokenRefresh } from "./auth-api";

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
      return await errorHandlerWrapper(
        async () => {
          const { data: userInvites = [] } = await apiCall();
          console.log("GET /users/invite success:", userInvites);
          return userInvites;
        },
        { logMessageLabel: "GET /users/invite error:" },
      )();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);

      return [];
    }
  }, [apiCall]);

  return { userInvites, loading, getUserInvites };
}

export function useCreateUserInvites() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    UserInviteData[],
    UserInvitePostData
  >(
    {
      url: "/users/invite",
      method: "post",
    },
    { manual: true },
  );

  const createUserInvites = useMemo(
    () =>
      errorHandlerWrapper(
        async (invitations: SingleUserInvitePostData[]) => {
          const { data: userInvites = [] } = await apiCall({
            data: { invitations },
          });
          console.log("POST /users/invite success:", userInvites);

          if (userInvites.length === 0) {
            throw new Error("No new users were created.");
          }
          return userInvites;
        },
        { logMessageLabel: "POST /users/invite error:" },
      ),
    [apiCall],
  );

  return {
    loading,
    createUserInvites,
  };
}

export function useUpdateUserInvite() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    UserInviteData,
    UserInvitePatchData
  >(
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
        { logMessageLabel: "PATCH /users/invite/:userInviteId error:" },
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
      errorHandlerWrapper(
        async (userInviteId: number | string) => {
          const url = `/users/invite/${userInviteId}`;

          const { data: deletedUserInvite } = await apiCall({
            url,
          });

          console.log(`DELETE ${url} success:`, deletedUserInvite);

          return deletedUserInvite;
        },
        { logMessageLabel: "DELETE /users/invite/:userInviteId error:" },
      ),
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
      return await errorHandlerWrapper(
        async () => {
          const { data: users = [] } = await apiCall();
          console.log("GET /users/ success:", users);
          return users;
        },
        { logMessageLabel: "GET /users/ error:" },
      )();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);

      return [];
    }
  }, [apiCall]);

  return { users, loading, getUsers };
}

export function useGetSelf() {
  const [{ data: self, loading }, apiCall] = useAxiosWithTokenRefresh<SelfData>(
    {
      url: "/users/self",
      method: "get",
    },
    { manual: true },
  );

  const getSelf = useCallback(async () => {
    try {
      return await errorHandlerWrapper(
        async () => {
          const { data: self } = await apiCall();

          console.log("GET /users/self success:", self);

          return self;
        },
        { logMessageLabel: "GET /users/self error:" },
      )();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);

      return undefined;
    }
  }, [apiCall]);

  return { self, loading, getSelf };
}

export function useUpdateSelf() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    SelfData,
    SelfPatchData
  >(
    {
      url: "/users/self",
      method: "patch",
    },
    { manual: true },
  );

  const updateSelf = useMemo(
    () =>
      errorHandlerWrapper(
        async (data: SelfPatchData) => {
          console.log("PATCH /users/self data:", data);

          const { data: self } = await apiCall({
            data,
          });
          console.log("PATCH /users/self success:", self);

          return self;
        },
        { logMessageLabel: "PATCH /users/self error:" },
      ),
    [apiCall],
  );

  return { loading, updateSelf };
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
        return await errorHandlerWrapper(
          async () => {
            const { data: user } = await apiCall({
              url,
            });
            console.log(`GET ${url} success:`, user);

            return user;
          },
          { logMessageLabel: `GET ${url} error:` },
        )();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        resolveApiError(error);
        return undefined;
      }
    },
    [apiCall],
  );

  return { user, loading, getSingleUser };
}

export function useUpdateUser() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    UserData,
    UserPatchData
  >(
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
        { logMessageLabel: "PATCH /users/:userId error:" },
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
      errorHandlerWrapper(
        async (userId: number | string) => {
          const url = `/users/${userId}`;

          const { data: deletedUser } = await apiCall({
            url,
          });

          console.log(`DELETE ${url} success:`, deletedUser);

          return deletedUser;
        },
        { logMessageLabel: "DELETE /users/:userId error:" },
      ),
    [apiCall],
  );

  return { loading, deleteUser };
}
