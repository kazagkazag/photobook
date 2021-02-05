import { Machine, assign } from "xstate";

export function createPageMachine(pageNumber) {
  return Machine({
    id: "photoBookPage",
    initial: "selectingPhoto",
    context: {
      fileHandler: null,
      title: null,
      desc: null,
      pageNumber,
    },
    states: {
      selectingPhoto: {
        on: {
          UPLOAD_PHOTO: "uploadingPhoto",
        },
      },
      uploadingPhoto: {
        after: {
          1000: "failure",
        },
        invoke: {
          src: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  fileHandler: "some file",
                });
              }, 500);
            }),
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
                  SET_TITLE: {
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
                  SET_DESC: {
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
          RETRY: "selectingPhoto",
        },
      },
      done: {},
    },
  });
}
