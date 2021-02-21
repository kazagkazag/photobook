import React from "react";
import { useService } from "@xstate/react";
import { events } from "./machines/page";

export const Page = ({ service, save }) => {
  const [current, send] = useService(service);
  const { fileHandler, title, desc } = current.context;

  return (
    <main>
      {current.matches("selectingPhoto") ? (
        <button onClick={() => send(events.UPLOAD_PHOTO)}>Upload image</button>
      ) : null}

      {current.matches("failure") ? <p>Error!</p> : null}

      {current.matches("details") || current.matches("done") ? (
        <div>
          <p>Image: {fileHandler}</p>
          <p>Title: {title}</p>
          <p>Description: {desc}</p>
        </div>
      ) : null}

      {current.matches("details.editingTitle.editing") ? (
        <button
          onClick={() =>
            send(events.SET_TITLE, {
              title: "test title",
            })
          }
        >
          Set title
        </button>
      ) : null}
      {current.matches("details.editingDesc.editing") ? (
        <button
          onClick={() =>
            send(events.SET_DESC, {
              desc: "test desc",
            })
          }
        >
          Set description
        </button>
      ) : null}

      {current.matches("done") ? (
        <button className="primary" onClick={save}>
          Save
        </button>
      ) : null}
    </main>
  );
};
