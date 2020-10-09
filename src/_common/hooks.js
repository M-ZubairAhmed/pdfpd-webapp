import React, { useEffect, useState } from "react";

import { USER_ID_LOCAL_STORAGE_KEY } from "_common/constants";

export const generateRandomUUID = () => {
  // make a string with base 36
  const randomWithMath = Math.random().toString(36).substr(2, 9);
  const randomWithDate = Date.now();

  return `${randomWithDate}-${randomWithMath}`;
};

export const useUserIDFromLocal = () => {
  const [useUserIDFromLocal, setUserIDFromLocal] = useState(null);

  useEffect(() => {
    const userIDInLocal = localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY);

    // no user id exists in the system yet
    if (userIDInLocal === null || userIDInLocal.trim().length === 0) {
      const newUserId = `user_${generateRandomUUID()}`;
      localStorage.setItem(USER_ID_LOCAL_STORAGE_KEY, newUserId);
      setUserIDFromLocal(newUserId);
    } else {
      setUserIDFromLocal(userIDInLocal);
    }
  }, []);

  return useUserIDFromLocal;
};
