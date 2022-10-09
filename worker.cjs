const fs = require("fs");

function expect(received) {
  return {
    toBe: (expected) => {
      if (received !== expected) {
        throw new Error(`Expected ${expected} but received ${received}.`);
      }
      return true;
    },
    toBeGreaterThan: (expected) => {
      if (received < expected) {
        throw new Error(`Expected ${received} to be greater than ${expected}.`);
      }
      return true;
    },

    toContain: (expected) => {
      if (received.includes(expected)) {
        throw new Error(`Expected ${received} to contain ${expected}.`);
      }
      return true;
    },
    toEqual: function (expected) {
      if (received != expected) {
        throw new Error("not equal");
      }
      return true;
    },
  };
}

// expect.objectContaining = (expected) => {
//   for (let key in received) {
//     if (expected[key] !== received[key]) {
//       throw new Error(
//         `Expected object containing ${key}:${expected[key]} but received ${key}:${received[key]}`
//       );
//     }
//   }

//   return true;
// };

exports.runTest = async function (testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");

  const testResult = {
    success: false,
    errorMessage: null,
  };

  try {
    eval(code);
    testResult.success = true;
  } catch (error) {
    testResult.errorMessage = error.message;
  }

  return testResult;
};
