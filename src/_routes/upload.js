import React, { useEffect } from "react";

import { ONE_MEGA_BYTE, FILE_STATUSES } from "_common/constants";

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

function convertBytesToMB(sizeInBytes) {
  const sizeInMBytes = sizeInBytes / ONE_MEGA_BYTE;

  // Return with one decimal number precision
  return Math.round(sizeInMBytes * 10) / 10;
}

const UploadFileRow = ({ file, filesStatusList = [] }) => {
  const name = file?.name ?? "";
  const size = file?.size ?? "";
  const id = file?.id ?? "";
  // Just an approx size in MB
  const sizeInMB = `${convertBytesToMB(size)} MB`;

  const fileStatus = filesStatusList.find((fileStatus) => fileStatus.id === id);

  let status = "";
  let uploadStage = "";
  if (fileStatus === undefined) {
    // if file is not found in the status list, we will assume its already processed
    status = FILE_STATUSES["COMPLETED"];
    uploadStage = "0";
  } else {
    // Else then just take the status from the state
    status = fileStatus.status;
    uploadStage = fileStatus.stage;
  }

  let displayStatusColor = "";
  if (status === FILE_STATUSES["INPROGRESS"]) {
    displayStatusColor = "bg-yellow-200 border-yellow-400";
  } else if (status === FILE_STATUSES["ERROR"]) {
    displayStatusColor = "bg-red-200 border-red-400";
  } else if (status === FILE_STATUSES["COMPLETED"]) {
    displayStatusColor = "bg-gray-200 border-gray-400";
  }

  return (
    <li
      className="bg-white w-full rounded-sm border-4 border-solid border-gray-300 mb-6
  flex flex-col rounded-t-lg"
    >
      <div className="flex flex-col xl:flex-row justify-between items-center px-2 pt-2">
        <h5
          className="text-lg text-gray-600 font-semibold truncate w-full text-left"
          title={name}
        >
          {name}
        </h5>
        <div className="order-first xl:order-last w-full text-right">
          <small
            className={`text-xs rounded-full ${displayStatusColor} px-2 font-semibold text-gray-700 
          border border-solid `}
          >
            {status}
          </small>
        </div>
      </div>
      <p className="text-sm text-gray-500 px-2 pb-2">{sizeInMB}</p>
      <progress
        max="100"
        value={uploadStage === "0" || uploadStage === "100" ? "0" : uploadStage}
      ></progress>
    </li>
  );
};

const UploadPage = ({ filesList = [], onUpload, filesStatusList = [] }) => {
  return (
    <ul className="list-none px-4">
      {filesList.map((file) => (
        <UploadFileRow
          key={file.id}
          file={file}
          filesStatusList={filesStatusList}
        />
      ))}
      <UploadNewRow onUpload={onUpload} />
    </ul>
  );
};

export default UploadPage;
