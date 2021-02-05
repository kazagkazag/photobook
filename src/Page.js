import React from "react";
import { useService } from "@xstate/react";

export const Page = ({ service, save }) => {
  const [current, send] = useService(service);
  const { fileHandler, title, desc } = current.context;

  return (
    <main>
      {current.matches("selectingPhoto") ? (
        <p>
          <button onClick={() => send("UPLOAD_PHOTO")}>Upload image</button>
        </p>
      ) : null}

      {current.matches("failure") ? <p>Error!</p> : null}

      {current.matches("details") ? (
        <div>
          <p>Image: {fileHandler}</p>
          <p>
            Title:
            {current.matches("details.editingTitle.editing") ? (
              <button
                onClick={() =>
                  send("SET_TITLE", {
                    title: "test title",
                  })
                }
              >
                Set title
              </button>
            ) : null}
            {current.matches("details.editingTitle.done") ? title : null}
          </p>
          <p>
            Description:
            {current.matches("details.editingDesc.editing") ? (
              <button
                onClick={() =>
                  send("SET_DESC", {
                    desc: "test desc",
                  })
                }
              >
                Set description
              </button>
            ) : null}
            {current.matches("details.editingDesc.done") ? desc : null}
          </p>
        </div>
      ) : null}

      {current.matches("done") ? (
        <p>
          <button onClick={save}>Save</button>
        </p>
      ) : null}
    </main>
  );
};
