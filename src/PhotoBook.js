import React from "react";
import { useMachine } from "@xstate/react";
import { photoBook } from "./machines/photoBook";
import { Page } from "./Page";

export const PhotoBook = () => {
  const [current, send] = useMachine(photoBook);

  const { pages, selectedPage } = current.context;

  return (
    <main>
      {current.matches("initialSettings") ? (
        <button
          onClick={() =>
            send("SELECT_NO_OF_PAGES", {
              pages: 3,
            })
          }
        >
          Add 3 pages
        </button>
      ) : null}

      {current.matches("selectingPage")
        ? pages.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                send("SELECT_PAGE", {
                  page: i,
                });
              }}
            >
              Edit page {i}
            </button>
          ))
        : null}

      {current.matches("selectingPage") ? (
        <p>
          <button onClick={() => send("FINISH")}>Done!</button>
        </p>
      ) : null}

      {current.matches("page") ? (
        <div>
          <h1>Page {selectedPage}</h1>
          <Page
            service={pages[selectedPage]}
            save={() => {
              send("SAVE");
            }}
          />
        </div>
      ) : null}

      {current.matches("summary") ? (
        <div>
          <p>Pages: {pages.length}</p>
          <p>Total: {pages.length * 10} USD</p>
        </div>
      ) : null}
    </main>
  );
};
