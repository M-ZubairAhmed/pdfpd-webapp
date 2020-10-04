import React, { useEffect, useState } from "react";

import { USER_ID_LOCAL_STORAGE_KEY } from "_common/constants";

export const useUserIDFromLocal = () => {
  const [useUserIDFromLocal, setUserIDFromLocal] = useState(null);

  useEffect(() => {
    const userID = localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY);

    if (userID !== null && userID.length !== 0) {
      setUserIDFromLocal(userID);
    }
  }, []);

  return useUserIDFromLocal;
};
