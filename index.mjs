import JestHasteMap from "jest-haste-map";
import { cpus } from "os";
import path from "path";
import { fileURLToPath } from "url";

// Get the root path to our project (Like `__dirname`).
const root = path.dirname(fileURLToPath(import.meta.url));

const hasteMapOptions = {
  extensions: ["js"],
  maxWorkers: cpus().length,
  name: "best-test-framework",
  platforms: [],
  rootDir: root,
  roots: [root],
};
// Need to use `.default` as of Jest 27.
const hasteMap = new JestHasteMap.default(hasteMapOptions);
// This line is only necessary in `jest-haste-map` version 28 or later.
await hasteMap.setupCachePath(hasteMapOptions);

const { hasteFS } = await hasteMap.build();
const testFiles = hasteFS.getAllFiles();

console.log(testFiles);
// ['/path/to/tests/01.test.js', '/path/to/tests/02.test.js', …]
