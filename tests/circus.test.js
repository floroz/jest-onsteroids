const m1 = require("./m1.js");
const m2 = require("./m2.js");

it("m1 import", () => {
  expect(m1).toBeDefined();
});

it("m2 import", () => {
  expect(m2).toBeDefined();
});

describe("circus test", () => {
  it("works", () => {
    expect(1).toBe(1);
  });
});

describe("second circus test", () => {
  it(`doesn't work`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(1).toBe(2);
  });
});
