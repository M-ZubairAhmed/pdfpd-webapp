import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  ONE_MEGA_BYTE,
  MIME_TYPE_PDF,
  TWENTY_FIVE_MEGA_BYTE,
  FILE_STATUSES,
} from "_common/constants";
import { useUserIDFromLocal } from "_common/hooks";

const UploadNewRow = ({ onFilesUpload }) => (
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
      onChange={onFilesUpload}
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

  let displayStatusColor = "bg-gray-200 border-gray-400";
  if (status === FILE_STATUSES["INPROGRESS"]) {
    displayStatusColor = "bg-yellow-200 border-yellow-400";
  } else if (status === FILE_STATUSES["ERROR"]) {
    displayStatusColor = "bg-red-200 border-red-400";
  } else if (status === FILE_STATUSES["COMPLETED"]) {
    displayStatusColor = "bg-green-200 border-green-400";
  }

  return (
    <li
      className={`bg-white w-full rounded-sm border-4 border-solid 
      border-gray-300 mb-6 flex flex-col rounded-t-lg`}
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
            className={`text-xs rounded-full ${displayStatusColor} px-2 py-1 font-semibold text-gray-700 
          border border-solid `}
          >
            {status}
          </small>
        </div>
      </div>
      <p className="text-sm text-gray-500 px-2 pb-2">{sizeInMB}</p>
      <progress
        max="100"
        value={
          uploadStage === 0 || uploadStage === 100 ? "0" : `${uploadStage}`
        }
      ></progress>
    </li>
  );
};

function getRandomInteger(min, max) {
  const minNumber = parseInt(min, 10);
  const maxNumber = parseInt(max, 10);

  return Math.floor(Math.random() * maxNumber + minNumber);
}

const UploadPage = () => {
  const userID = useUserIDFromLocal();

  const [filesList, setFilesList] = useState([]);
  const [filesStatusList, setFilesStatusList] = useState([]);

  function onFilesUpload(event) {
    event.preventDefault();

    const uploadedFiles = event?.target?.files ?? [];

    if (uploadedFiles && uploadedFiles.length !== 0) {
      let filesList = [];
      let filesStatusList = [];

      for (const uploadedFile of uploadedFiles) {
        const fileType = uploadedFile?.type ?? "";
        const fileSize = uploadedFile?.size ?? 0;
        const fileName = uploadedFile?.name ?? "";
        const fileID = `${getRandomInteger(
          "100001",
          "1000001"
        )}-${fileName.toLowerCase()}-${getRandomInteger("10001", "100001")}`;

        // filter out any unsupported pdfs
        if (
          fileType === MIME_TYPE_PDF &&
          fileName.trim().length !== 0 &&
          fileSize < TWENTY_FIVE_MEGA_BYTE &&
          fileSize > 0
        ) {
          // only push correctly supported pdfs
          filesList.push({
            id: fileID,
            name: fileName,
            size: fileSize,
            data: uploadedFile,
          });

          // build the correct files status list
          filesStatusList.push({
            id: fileID,
            status: FILE_STATUSES["QUEUED"],
            stage: "0",
          });
        }
      }

      // Update the files list
      setFilesList((currentFilesList) => [...currentFilesList, ...filesList]);

      // Update the files status list
      setFilesStatusList((currentFilesStatusList) => [
        ...currentFilesStatusList,
        ...filesStatusList,
      ]);
    }
  }

  function trackFileUploadProgress(progressEvent, fileID) {
    const stage = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );

    setFilesStatusList((currentFilesStatusList) => {
      // Find the index of the uploading file in the file status list
      const fileIndexInStatusList = currentFilesStatusList.findIndex(
        (fileStatus) => fileStatus.id === fileID
      );

      const status =
        stage === 100
          ? FILE_STATUSES["COMPLETED"]
          : FILE_STATUSES["INPROGRESS"];

      // update the file status to inprogress and add the uploaded progress
      const processingFileInStatusList = Object.assign(
        {},
        currentFilesStatusList[fileIndexInStatusList],
        { status, stage }
      );

      // return the new array of file status list with the updated file status
      return [
        ...currentFilesStatusList.slice(0, fileIndexInStatusList),
        processingFileInStatusList,
        ...currentFilesStatusList.slice(fileIndexInStatusList + 1),
      ];
    });
  }

  async function doUploadFile(fileToUpload) {
    const file = fileToUpload?.data ?? "";
    const fileID = fileToUpload?.id ?? "";

    const data = new FormData();
    data.append("file", file, fileID);

    try {
      const response = await axios({
        method: "POST",
        url: `${process.env.API_BASE_URL}/upload`,
        data,
        onUploadProgress: (progressEvent) =>
          trackFileUploadProgress(progressEvent, fileID),
      });
    } catch (err) {
      console.error("err in upload", err);
    }
  }

  // effect called after every new file upload
  useEffect(() => {
    let filesQueuedToUpload = [];
    filesList.forEach((file) => {
      const id = file?.id ?? "";

      // find the file in file status list to get its status
      const fileInStatusList = filesStatusList.find(
        (fileStatus) => fileStatus.id === id
      );
      const fileStatus = fileInStatusList?.status ?? "";

      // Check if the file is exists in file status list
      if (
        id.length !== 0 ||
        filesStatusList !== undefined ||
        fileStatus.length !== 0
      ) {
        // only add the files which havent yet downloaded
        if (fileStatus === FILE_STATUSES["QUEUED"]) {
          filesQueuedToUpload.push(file);
        }
      }
    });

    if (filesQueuedToUpload.length > 0) {
      filesQueuedToUpload.forEach((file) => doUploadFile(file));
    }
  }, [filesList]);

  return (
    <ul className="list-none px-4 xl:px-0">
      {filesList.map((file) => (
        <UploadFileRow
          key={file.id}
          file={file}
          filesStatusList={filesStatusList}
        />
      ))}
      <UploadNewRow onFilesUpload={onFilesUpload} />
    </ul>
  );
};

export default UploadPage;
