import React, { StrictMode, Suspense, lazy, useState, useEffect } from "react";
import { render } from "react-dom";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

import "../_styles/index.scss";

import { useUserIDFromLocal } from "_common/hooks";
import { MIME_TYPE_PDF, TWENTY_FIVE_MEGA_BYTE } from "_common/constants";

const DEF_TAB_INDEX = 1;

const ReadPage = lazy(() =>
  import(/* webpackChunkName: "read-page" */ "_routes/read")
);

const UploadPage = lazy(() =>
  import(/* webpackChunkName: "upload-page" */ "_routes/upload")
);

const FullscreenLoader = () => (
  <div
    // Inline style to avoid render blocking
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <h4 style={{ fontWeight: "bold", fontSize: "2em", color: "gainsboro" }}>
      Loading, please hang on
    </h4>
  </div>
);

const NavItem = ({ isActive = false, children }) => (
  <Tab
    className={`${
      isActive
        ? "bg-pink-800 text-white border-pink-900 cursor-default"
        : "bg-gray-400 text-gray-600 border-gray-400 cursor-pointer"
    } px-10 py-3 mx-3 rounded-full font-semibold border-solid border-2 my-2
      hover:border-pink-900 transition duration-500 ease
      `}
  >
    {children}
  </Tab>
);

const Nav = ({ activeTabIndex }) => (
  <>
    <TabList
      as="nav"
      className="flex flex-row justify-between p-4 rounded-full flex-wrap"
    >
      <NavItem isActive={activeTabIndex === 0}>Preview</NavItem>
      <NavItem isActive={activeTabIndex === 1}>Upload</NavItem>
    </TabList>
  </>
);

function getRandomInteger(min, max) {
  const minNumber = parseInt(min,10)
  const maxNumber = parseInt(max,10)

  return Math.floor(Math.random() * maxNumber + minNumber)
}

const App = () => {
  const userID = useUserIDFromLocal();

  const [activeTabIndex, changeTabIndex] = useState(DEF_TAB_INDEX);

  function onTabChange(tabIndex) {
    changeTabIndex(tabIndex);
  }

  const [savedText, setSavedText] = useState("");

  const [filesList, setFilesList] = useState([]);

  function onUpload(event) {
    event.preventDefault();

    const uploadedFiles = event?.target?.files ?? [];

    if (uploadedFiles && uploadedFiles.length !== 0) {
      let filesList = [];

      for (const uploadedFile of uploadedFiles) {
        const fileType = uploadedFile?.type ?? "";
        const fileSize = uploadedFile?.size ?? 0;
        const fileName = uploadedFile?.name ?? "";

        // filter out any unsupported pdfs
        if (
          fileType === MIME_TYPE_PDF &&
          fileName.trim().length !== 0 &&
          fileSize < TWENTY_FIVE_MEGA_BYTE &&
          fileSize > 0
        ) {
          filesList.push({
            id: `${getRandomInteger("100001","1000001")}-${fileName.toLowerCase()}-${getRandomInteger("10001","100001")}`,
            name: fileName,
            size: fileSize,
            data: uploadedFile,
          });
        }
      }

      // Update the files list
      setFilesList((currentFilesList) => [...currentFilesList, ...filesList]);
    }
  }

  useEffect(() => {
    // Try fetch to stored Texts of the user from DB
  },[])

  return (
    <StrictMode>
      <Suspense fallback={<FullscreenLoader />}>
        <Tabs
          defaultIndex={DEF_TAB_INDEX}
          onChange={onTabChange}
          className="container mx-auto flex flex-col justify-center items-center"
        >
          <Nav activeTabIndex={activeTabIndex} />
          <TabPanels as="main" className="w-full min-h-screen">
            <TabPanel>
              <ReadPage savedText={savedText} />
            </TabPanel>
            <TabPanel>
              <UploadPage onUpload={onUpload} filesList={filesList} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Suspense>
    </StrictMode>
  );
};

render(<App />, document.getElementById("REACT_ROOT_APP"));
