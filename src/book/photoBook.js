import { Machine, assign, spawn } from "xstate";
import { createPageMachine } from "./page/page";

export const events = {
  SELECT_NO_OF_PAGES: "SELECT_NO_OF_PAGES",
  SELECT_PAGE: "SELECT_PAGE",
  FINISH: "FINISH",
  SAVE: "SAVE",
};

export const photoBook = createPhotoBook();

export function createPhotoBook() {
  return Machine({
    id: "photoBook",
    initial: "initialSettings",
    context: {
      pages: [],
      selectedPage: null,
    },
    states: {
      initialSettings: {
        on: {
          [events.SELECT_NO_OF_PAGES]: {
            target: "selectingPage",
            actions: assign((context, event) => {
              const noOfPages = event.pages;
              const pages = [];

              for (let i = 0; i < noOfPages; i++) {
                pages.push(
                  spawn(createPageMachine(i), {
                    sync: true,
                  })
                );
              }

              return {
                ...context,
                pages,
              };
            }),
          },
        },
      },
      selectingPage: {
        on: {
          [events.SELECT_PAGE]: {
            target: "page",
            actions: assign((context, event) => {
              return {
                ...context,
                selectedPage: event.page,
              };
            }),
          },
          [events.FINISH]: {
            target: "summary",
            cond: (ctx, e) => {
              const allDone = ctx.pages.every((p) => {
                return p.state.value === "done";
              });

              if (!allDone) {
                alert("Ooops! Please fill out all the pages!");
              }

              return allDone;
            },
          },
        },
      },
      page: {
        on: {
          [events.SAVE]: "selectingPage",
        },
      },
      summary: {},
    },
  });
}
