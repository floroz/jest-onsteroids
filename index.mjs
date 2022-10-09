import chalk from "chalk";
import JestHasteMap from "jest-haste-map";
import { Worker } from "jest-worker";
import { cpus } from "os";
import path from "path";
import { fileURLToPath } from "url";

// Get the root path to our project (Like `__dirname`).
const root = path.dirname(fileURLToPath(import.meta.url));

const hasteMapOptions = {
  extensions: ["js"], // Tells jest-haste-map to only crawl .js files.
  maxWorkers: cpus().length, // Parallelizes across all available CPUs.
  name: "best-test-framework", // Used for caching.
  platforms: [], // This is only used for React Native, leave empty.
  rootDir: root, // The project root.
  roots: [root], // Can be used to only search a subset of files within `rootDir`.
};
// Need to use `.default` as of Jest 27.
const hasteMap = new JestHasteMap.default(hasteMapOptions);
// This line is only necessary in `jest-haste-map` version 28 or later.
await hasteMap.setupCachePath(hasteMapOptions);
// Build and return an in-memory HasteFS ("Haste File System") instance.
const { hasteFS } = await hasteMap.build();

const testFiles = hasteFS.matchFilesWithGlob([
  process.argv[2] ? `**/${process.argv[2]}*` : "**/*.test.js",
]);

const worker = new Worker(path.join(root, "worker.cjs"), {
  enableWorkerThreads: true,
});

let hasFailed = false;

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const { success, testResults, errorMessage } = await worker.runTest(
      testFile
    );
    const status = success
      ? chalk.green.inverse.bold(" PASS ")
      : chalk.red.inverse.bold(" FAIL ");

    console.log(status + " " + chalk.dim(path.relative(root, testFile)));
    if (!success) {
      hasFailed = true;
      if (testResults) {
        testResults
          .filter((result) => result.errors.length)
          .forEach((result) =>
            console.log(
              result.testPath.slice(1).join(" ") + "\n" + result.errors[0]
            )
          );
      } else if (errorMessage) {
        console.log("  " + errorMessage);
      }
    }
  })
);

worker.end();
if (hasFailed) {
  console.log(
    "\n" + chalk.red.bold("Test run failed, please fix all the failing tests.")
  );
  // Set an exit code to indicate failure.
  process.exitCode = 1;
}
