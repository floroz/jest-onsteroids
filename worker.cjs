const fs = require("fs");

const expect = (received) => ({
  toBe: (expected) => {
    if (received !== expected) {
      throw new Error(`Expected ${expected} but received ${received}.`);
    }
    return true;
  },
});

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
