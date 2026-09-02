import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"
import {pathToFileURL} from "node:url"

// Resolve from the package entry rather than from here: in an installed
// tree the copy hoisted to the root belongs to whichever dependency won,
// while the bundles load the one beside the package itself.
const fromPackage = createRequire(createRequire(import.meta.url).resolve("serve-static-git"))
const mimeEntry = pathToFileURL(fromPackage.resolve("mime")).href

// The .cjs bundle calls `require("mime").getType`, the .mjs takes the
// default export. A dependency that ships ESM only leaves the CommonJS
// side holding a module namespace with no getType.
test("mime CJS API", () => {
    assert.equal(typeof fromPackage("mime").getType, "function")
})

test("mime ESM API", async () => {
    assert.equal(typeof (await import(mimeEntry)).default.getType, "function")
})
