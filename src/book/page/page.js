import { Machine, assign } from "xstate";

export const events = {
  UPLOAD_PHOTO: "UPLOAD_PHOTO",
  SET_TITLE: "SET_TITLE",
  SET_DESC: "SET_DESC",
  RETRY: "RETRY",
};

export function createPageMachine() {
  return Machine(
    {
      id: "photoBookPage",
      initial: "selectingPhoto",
      context: {
        fileHandler: null,
        title: null,
        desc: null,
      },
      states: {
        selectingPhoto: {
          on: {
            [events.UPLOAD_PHOTO]: "uploadingPhoto",
          },
        },
        uploadingPhoto: {
          after: {
            1000: "failure",
          },
          invoke: {
            src: "uploadPhoto",
            onDone: {
              target: "details",
              actions: assign({
                fileHandler: (ctx, event) => event.data.fileHandler,
              }),
            },
            onError: {
              target: "failure",
            },
          },
        },
        details: {
          type: "parallel",
          always: {
            target: "done",
            cond: (ctx, event) => {
              const { fileHandler, title, desc } = ctx;

              return Boolean(fileHandler) && Boolean(title) && Boolean(desc);
            },
          },
          states: {
            editingTitle: {
              initial: "editing",
              states: {
                editing: {
                  on: {
                    [events.SET_TITLE]: {
                      target: "done",
                      actions: assign({
                        title: (ctx, event) => event.title,
                      }),
                    },
                  },
                },
                done: {},
              },
            },
            editingDesc: {
              initial: "editing",
              states: {
                editing: {
                  on: {
                    [events.SET_DESC]: {
                      target: "done",
                      actions: assign((ctx, event) => {
                        return {
                          ...ctx,
                          desc: event.desc,
                        };
                      }),
                    },
                  },
                },
                done: {},
              },
            },
          },
        },
        failure: {
          on: {
            [events.RETRY]: "selectingPhoto",
          },
        },
        done: {},
      },
    },
    {
      services: {
        uploadPhoto: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                fileHandler: "some file",
              });
            }, 500);
          });
        },
      },
    }
  );
}
