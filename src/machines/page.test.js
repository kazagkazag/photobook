import { interpret } from "xstate";
import { createPageMachine } from "./page";

describe("Page machine", () => {
  let machine = null;

  beforeEach(() => {
    machine = createPageMachine(0);
  });

  it("should start in the selecting photo state", () => {
    expect(machine.initialState.value).toBe("selectingPhoto");
  });

  it("should go to the uploading photo state after selecting a file", () => {
    const result = machine.transition("selectingPhoto", {
      type: "UPLOAD_PHOTO",
    });

    expect(result.matches("uploadingPhoto")).toBeTruthy();
  });

  it("should go to the details state after successfully uploading the file", (done) => {
    const service = interpret(machine).onTransition((state) => {
      if (state.matches("details")) {
        done();
      }
    });

    service.start();

    service.send({ type: "UPLOAD_PHOTO" });
  });

  it("should go to the failure state in the case of an error while uploading the file", (done) => {
    const failingService = () => Promise.reject("Error");

    const service = interpret(
      machine.withConfig({
        services: {
          uploadPhoto: failingService,
        },
      })
    ).onTransition((state) => {
      if (state.matches("failure")) {
        done();
      }
    });

    service.start();

    service.send({ type: "UPLOAD_PHOTO" });
  });
  it("should go to the failure state in the case of a timeout while uploading the file", (done) => {
    jest.useFakeTimers();
    const neverEndingService = () => new Promise(() => {});

    const service = interpret(
      machine.withConfig({
        services: {
          uploadPhoto: neverEndingService,
        },
      })
    ).onTransition((state) => {
      if (state.matches("failure")) {
        done();
      }
    });

    service.start();

    service.send({ type: "UPLOAD_PHOTO" });
    jest.runAllTimers();
  });

  it("should go to the selecting photo state after retrying from the failure state", () => {
    const result = machine.transition("failure", {
      type: "RETRY",
    });

    expect(result.matches("selectingPhoto")).toBeTruthy();
  });

  it("should go to the done state from the details state once all the data provided", () => {
    const withFile = machine.withContext({
      fileHandler: "test",
    });
    const withTitle = withFile.transition("details.editingTitle.editing", {
      type: "SET_TITLE",
      title: "test title",
    });
    const withDesc = withFile.transition(withTitle, {
      type: "SET_DESC",
      desc: "test desc",
    });

    expect(withDesc.matches("done")).toBeTruthy();
    expect(withDesc.context).toEqual({
      fileHandler: "test",
      title: "test title",
      desc: "test desc",
    });
  });
});

function flushPromises() {
  return new Promise(setImmediate);
}
