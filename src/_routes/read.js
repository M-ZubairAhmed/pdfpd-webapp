import React, { useEffect } from "react";

const ReadPage = ({ savedText }) => {
  return (
    <textarea
      className="bg-white w-full h-screen box-border resize-none border-8 
  border-pink-600 rounded-lg p-1 xl:p-4 text-lg leading-snug
  placeholder-gray-700"
      value={savedText}
      readOnly
      placeholder="Upload PDFs and start reading"
    />
  );
};

export default ReadPage;
