import React, { useEffect } from "react";

const UploadNewRow = () => (
  <li
    className="bg-white h-20 w-full rounded-lg border-4 border-dashed border-gray-400
   text-gray-500 text-xl font-black
   hover:text-gray-600 hover:border-gray-500 transition duration-300 ease-in-out"
  >
    <label
      htmlFor="upload-input"
      className="w-full h-full flex justify-center items-center cursor-pointer"
    >
      Click to upload PDFs
    </label>
    <input
      id="upload-input"
      type="file"
      className="hidden"
      accept=".pdf"
      multiple
    />
  </li>
);

const UploadFileRow = () => {
  return <div>asa</div>;
};

const UploadPage = ({ pdfUploadList }) => {
  return (
    <ul className="list-none">
      {pdfUploadList.map((pdfUploadFile) => (
        <UploadFileRow pdfUploadFile={pdfUploadList} />
      ))}
      <UploadNewRow />
    </ul>
  );
};

export default UploadPage;
