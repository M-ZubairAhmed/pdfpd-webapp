import React, { useEffect } from "react";

const UploadNewRow = ({ onUpload }) => (
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
      onChange={onUpload}
    />
  </li>
);

const UploadFileRow = () => {
  return <div>asa</div>;
};

const UploadPage = ({ filesList = [], onUpload }) => {
  return (
    <ul className="list-none">
      {filesList.map((file) => (
        <UploadFileRow key={filesList.id} file={file} />
      ))}
      <UploadNewRow onUpload={onUpload} />
    </ul>
  );
};

export default UploadPage;
