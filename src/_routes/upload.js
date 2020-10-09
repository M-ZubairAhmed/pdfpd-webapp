import React, { useEffect, useState } from "react";
import axios from "axios";
import sanitizer from "string-sanitizer";

import {
  ONE_MEGA_BYTE,
  MIME_TYPE_PDF,
  TEN_MEGA_BYTES,
  FILE_STATUSES,
} from "_common/constants";
import { useUserIDFromLocal, generateRandomUUID } from "_common/hooks";

function sanitizeName(text) {
  if (text.trim().length === 0) {
    return "";
  }

  // replace spaces with dash
  const textWithRemovedSpace = sanitizer.addDash(text);
  // Keep other language letter but remove illegal chars
  const textSanitized = sanitizer.sanitize.keepUnicode(textWithRemovedSpace);
  const textSanitizedInLowerCaps = textSanitized.toLowerCase();

  return textSanitizedInLowerCaps;
}

function convertBytesToMB(sizeInBytes) {
  const sizeInMBytes = sizeInBytes / ONE_MEGA_BYTE;

  // Return with one decimal number precision
  return Math.round(sizeInMBytes * 10) / 10;
}

const RowOfUpload = ({ onFilesUpload }) => (
  <li
    className="bg-white h-16 w-full rounded-lg border-4 border-dashed border-gray-400
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

const RowOfFile = ({ file, filesStatusList = [] }) => {
  const fileID = file?.fileID ?? "";
  const fileName = file?.fileName ?? "";

  const fileSizeInBytes = file?.fileSize ?? "";
  const fileSize = `${convertBytesToMB(fileSizeInBytes)} MB`;

  const fileInStatusList = filesStatusList.find(
    (fileStatus) => fileStatus.fileID === fileID
  );
  const fileStatus = fileInStatusList?.fileStatus ?? "";
  if (fileStatus.length === 0) {
    // if file status is not found in file status list
    return null;
  }

  const fileStatusMessage = fileInStatusList?.fileStatusMessage ?? "";

  let displayStatusColor = "";
  let progressValue = "0";
  let progressColor = false;

  if (fileStatus === FILE_STATUSES.QUEUED) {
    displayStatusColor = "bg-yellow-200 border-yellow-400";
    progressColor = true;
    progressValue = "100";
  } else if (fileStatus === FILE_STATUSES.ERROR) {
    displayStatusColor = "bg-red-200 border-red-400";
    progressColor = false;
    progressValue = "0";
  } else if (fileStatus === FILE_STATUSES.COMPLETED) {
    displayStatusColor = "bg-green-200 border-green-400";
    progressValue = "0";
    progressColor = false;
  }

  return (
    <li
      className={`bg-white w-full rounded-lg border-4 border-solid 
      border-gray-300 mb-6 flex flex-col`}
    >
      <div className="flex flex-col xl:flex-row justify-between items-center px-2 pt-2">
        <h5
          className="text-lg text-gray-600 font-semibold truncate w-full text-left"
          title={fileName}
        >
          {fileName}
        </h5>
        <div className="order-first xl:order-last w-full text-right">
          <small
            className={`text-xs rounded-full ${displayStatusColor} px-2 py-1 font-semibold text-gray-700 
          border border-solid`}
          >
            {fileStatus}
          </small>
        </div>
      </div>
      <p className="text-sm text-gray-500 px-2 pb-2">{fileSize}</p>
      <div className="h-6 flex flex-col justify-end">
        {fileStatusMessage.length === 0 ? (
          <progress
            max="100"
            value={progressValue}
            className="animate-pulse"
          ></progress>
        ) : (
          <p className="text-center pb-2 text-sm text-gray-600 font-semibold">
            {fileStatusMessage}
          </p>
        )}
      </div>
    </li>
  );
};

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

      // Allow multiple files upload
      for (const uploadedFile of uploadedFiles) {
        const fileType = uploadedFile?.type ?? "";
        const fileSize = uploadedFile?.size ?? 0;
        const fileName =
          uploadedFile && uploadedFile.name && uploadedFile.name.length !== 0
            ? sanitizeName(uploadedFile.name)
            : "";
        const fileID = `${generateRandomUUID()}-${fileName}`;

        // filter out any unsupported pdfs
        if (
          fileType === MIME_TYPE_PDF &&
          fileName.trim().length !== 0 &&
          fileSize < TEN_MEGA_BYTES &&
          fileSize > 0
        ) {
          // only push correctly supported pdfs
          filesList.push({
            fileID,
            fileName,
            fileSize,
            fileData: uploadedFile,
          });

          // build the correct files status list
          filesStatusList.push({
            fileID,
            fileStatus: FILE_STATUSES.QUEUED,
            fileStatusMessage: "",
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

  function trackFileUploadProgress(fileID, fileStatus, fileStatusMessage) {
    setFilesStatusList((currentFilesStatusList) => {
      // Find the index of the uploading file in the file status list
      const fileIndexInStatusList = currentFilesStatusList.findIndex(
        (fileStatus) => fileStatus.fileID === fileID
      );

      if (fileIndexInStatusList === -1) {
        return [...currentFilesStatusList];
      }

      // update the file status to correct status assesed from above
      const processingFileInStatusList = {
        fileID,
        fileStatus,
        fileStatusMessage,
      };

      // return the new array of file status list with the updated file status
      return [
        ...currentFilesStatusList.slice(0, fileIndexInStatusList),
        processingFileInStatusList,
        ...currentFilesStatusList.slice(fileIndexInStatusList + 1),
      ];
    });
  }

  async function doUploadFile(fileToUpload) {
    const fileData = fileToUpload?.fileData ?? "";
    const fileID = fileToUpload?.fileID ?? "";
    const fileName = fileToUpload?.fileName ?? "";

    const data = new FormData();
    data.append(fileID, fileData, fileName);

    try {
      const response = await axios({
        method: "POST",
        url: `${process.env.API_BASE_URL}/upload`,
        headers: {
          "User-ID": userID,
        },
        data,
      });

      if (response.status === 201) {
        trackFileUploadProgress(fileID, FILE_STATUSES.COMPLETED, "");
      } else {
        throw new Error("File didnt proccess successfully");
      }
    } catch (error) {
      let errorMessage = "";
      if (error.response) {
        errorMessage =
          error?.response?.data?.message ?? "File failed to process";
      } else if (error.request) {
        errorMessage = "Couldnt recieve any response on processing";
      } else {
        errorMessage = "The network request isnt setup correctly";
      }
      trackFileUploadProgress(fileID, FILE_STATUSES.ERROR, errorMessage);
    }
  }

  // effect called after every new file(s) upload
  useEffect(() => {
    let filesQueuedToUpload = [];

    filesList.forEach((file) => {
      const fileID = file?.fileID ?? "";

      // find the file in file status list to get its status
      const fileInStatusList = filesStatusList.find(
        (fileStatus) => fileStatus.fileID === fileID
      );
      const fileStatus = fileInStatusList?.fileStatus ?? "";

      // Check if the file exists in file status list
      if (
        fileID.length !== 0 ||
        fileInStatusList !== undefined ||
        fileStatus.length !== 0
      ) {
        // only add the files which havent yet downloaded
        if (fileStatus === FILE_STATUSES.QUEUED) {
          filesQueuedToUpload.push(file);
        }
      }
    });

    if (filesQueuedToUpload.length > 0) {
      // incrementally start uploading the file
      filesQueuedToUpload.forEach((file) => doUploadFile(file));
    }
  }, [filesList]);

  return (
    <ul className="list-none px-4 xl:px-0">
      {filesList.map((file) => (
        <RowOfFile
          key={file.fileID}
          file={file}
          filesStatusList={filesStatusList}
        />
      ))}
      <RowOfUpload onFilesUpload={onFilesUpload} />
    </ul>
  );
};

export default UploadPage;
