import { Machine, assign, spawn } from "xstate";
import { createPageMachine } from "./page";

export const photoBook = Machine({
  id: "photoBook",
  initial: "initialSettings",
  context: {
    pages: [],
    selectedPage: null,
  },
  states: {
    initialSettings: {
      on: {
        SELECT_NO_OF_PAGES: {
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
        SELECT_PAGE: {
          target: "page",
          actions: assign((context, event) => {
            return {
              ...context,
              selectedPage: event.page,
            };
          }),
        },
        FINISH: {
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
        SAVE: "selectingPage",
      },
    },
    summary: {},
  },
});
