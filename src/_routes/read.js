import React, { useEffect, useState } from "react";

import { useUserIDFromLocal } from "_common/hooks";

const ReadPage = () => {
  const userID = useUserIDFromLocal();

  const [savedText, setSavedText] = useState("");

  const showHelpText = savedText.trim().length === 0;

  return (
    <article
      className={`${
        showHelpText ? "bg-pink-200" : "bg-white"
      } w-full h-screen border-8 
      border-pink-600 rounded-lg p-1 xl:p-4 text-lg leading-snug
      overflow-y-scroll overscroll-auto`}
    >
      {savedText}
      {showHelpText && (
        <div className="w-full text-center italic text-2xl font-semibold text-gray-700">
          Upload few PDFs to start reading extracted text here.
        </div>
      )}
    </article>
  );
};

export default ReadPage;
