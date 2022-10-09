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

const testFiles = hasteFS.matchFilesWithGlob(["**/*.test.js"]);

const worker = new Worker(path.join(root, "worker.cjs"), {
  enableWorkerThreads: true,
});

const failedTests = [];
const successTests = [];

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const testResults = await worker.runTest(testFile);

    if (testResults.success) {
      successTests.push(testResults);
    } else {
      failedTests.push(testResults);
    }
  })
);

if (failedTests.length) {
  failedTests.forEach((result) =>
    console.error(chalk.red(result.errorMessage))
  );
  console.error(
    chalk.red(
      `Failed: ${failedTests.length} ${
        failedTests.length > 1 ? "Tests" : "Test"
      } out of ${successTests.length + failedTests.length}`
    )
  );
  process.exit(1);
} else {
  console.log(
    chalk.green(
      `Successfully run ${successTests.length} ${
        successTests.length > 1 ? "Tests" : "Test"
      }`
    )
  );
  process.exit(0);
}
