import React, { StrictMode, Suspense, lazy, useState } from "react";
import { render } from "react-dom";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

import "../_styles/index.scss";

const DEF_TAB_INDEX = 0;

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
        : "bg-gray-200 text-gray-600 border-gray-400 cursor-pointer"
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
      className="flex flex-row justify-between px-4 pt-4 pb-6 rounded-full flex-wrap"
    >
      <header className="hero-image-bg w-full bg-center bg-no-repeat bg-contain h-40" />
      <NavItem isActive={activeTabIndex === 0}>Preview</NavItem>
      <NavItem isActive={activeTabIndex === 1}>Upload</NavItem>
    </TabList>
  </>
);

const App = () => {
  const [activeTabIndex, changeTabIndex] = useState(DEF_TAB_INDEX);

  function onTabChange(tabIndex) {
    changeTabIndex(tabIndex);
  }

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
              <ReadPage />
            </TabPanel>
            <TabPanel>
              <UploadPage />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Suspense>
    </StrictMode>
  );
};

render(<App />, document.getElementById("REACT_ROOT_APP"));
