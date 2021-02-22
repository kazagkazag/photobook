import { createPhotoBook, events } from "./photoBook";

describe("Photobook machine", () => {
  let machine = null;

  beforeEach(() => {
    machine = createPhotoBook();
    jest.restoreAllMocks();
  });

  it("should start in the inital settings state", () => {
    expect(machine.initialState.value).toBe("initialSettings");
  });

  it("should go to the selecting page state after selecting the number of pages", () => {
    const result = machine.transition("initialSettings", {
      type: events.SELECT_NO_OF_PAGES,
      pages: 2,
    });
    const { context } = result;

    expect(result.matches("selectingPage")).toBeTruthy();
    expect(context.pages).toHaveLength(2);
    expect(context.selectedPage).toBe(null);
  });

  it("should go to the page state after selecting the page", () => {
    const result = machine.transition("selectingPage", {
      type: events.SELECT_PAGE,
      page: 1,
    });

    expect(result.matches("page")).toBeTruthy();
    expect(result.context.selectedPage).toBe(1);
  });

  it("should go to the summary state only if all pages are complete", () => {
    const result = machine
      .withContext({
        pages: [completedPage(), completedPage()],
      })
      .transition("selectingPage", {
        type: events.FINISH,
      });

    expect(result.matches("summary")).toBeTruthy();
  });

  it("should NOT go to the summary state only if any pages is NOT complete", () => {
    window.alert = jest.fn();
    const result = machine
      .withContext({
        pages: [completedPage(), incompletedPage()],
      })
      .transition("selectingPage", {
        type: events.FINISH,
      });

    expect(result.matches("selectingPage")).toBeTruthy();
    expect(window.alert).toHaveBeenCalled();
  });

  it("should go to the selecting page state if page editing is finished", () => {
    const result = machine.transition("page", {
      type: events.SAVE,
    });

    expect(result.matches("selectingPage")).toBeTruthy();
  });

  function completedPage() {
    return {
      state: {
        value: "done",
      },
    };
  }

  function incompletedPage() {
    return {
      state: {
        value: "not done yet",
      },
    };
  }
});
