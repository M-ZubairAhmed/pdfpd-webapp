import React, { useEffect, useState } from "react";
import firebase from "firebase";
import("firebase/firestore");

import { useUserIDFromLocal } from "_common/hooks";

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_PROJECT_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
});

var firebaseDB = firebase.firestore();

const ReadPage = () => {
  const userID = useUserIDFromLocal();

  const [savedDocuments, setSavedText] = useState([]);

  const showHelpText = savedDocuments.length === 0;

  useEffect(() => {
    let firebaseListenerUnsubscribe;

    if (userID !== null) {
      firebaseListenerUnsubscribe = firebaseDB
        .collection(userID)
        .orderBy("completedAt")
        .onSnapshot(
          (allUserDocuments) => {
            let newUserDocuments = [];

            allUserDocuments.forEach((userDocument) => {
              const fileID = userDocument.data().fileID
              const fileName = userDocument.data().fileName;
              const fileText = userDocument.data().fileText;
              const fileCompletedAt = userDocument
                .data()
                .completedAt.toDate()
                .toString();

              if (fileName.length !== 0 && fileText.length !== 0)
                newUserDocuments.push({
                  fileID,
                  fileName,
                  fileText,
                  fileCompletedAt,
                });
            });

            setSavedText(newUserDocuments);
          },
          (err) => {
            console.error(err);
          }
        );
    }

    return () => {
      // unsubscribe real time listener
      if (userID !== null && firebaseListenerUnsubscribe) {
        firebaseListenerUnsubscribe();
      }
    };
  }, [userID]);

  return (
    <article
      className={`${
        showHelpText ? "bg-pink-200" : "bg-white"
      } w-full h-screen border-4 
      border-pink-600 rounded-lg p-1 xl:p-4 text-lg leading-snug
      overflow-y-scroll overscroll-auto overflow-x-hidden`}
    >
      {savedDocuments.map((document) => (
        <section
          className="mb-6 pb-4 border-b-4 border-solid border-gray-300"
          key={document.fileID}
        >
          <h1 className="text-lg text-gray-900">{document.fileName}</h1>
          <p className="text-sm text-gray-700 pb-2 pt-1">
            {document.fileCompletedAt}
          </p>
          <p className="text-base text-gray-800">{document.fileText}</p>
        </section>
      ))}
      {showHelpText && (
        <div className="w-full text-center italic text-2xl font-semibold text-gray-700">
          Upload few PDFs to start reading extracted text here.
        </div>
      )}
    </article>
  );
};

export default ReadPage;
