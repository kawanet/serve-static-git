SRC := $(wildcard ../lib/*.ts ../types/*.ts)
BUILDER_SRC := $(wildcard ./*.ts)

MJS_DST := ../dist/serve-static-git.mjs
CJS_DST := ../dist/serve-static-git.cjs

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts

# The middleware itself is small (~3 KB). Anything noticeably larger
# means an accidental bundling of an external dependency or a Node
# built-in — fail the build so it cannot slip in.
MAX_BYTES := 10000

# Every named export the package documents must survive the round trip
# through both CJS and ESM bundles. List them once and assert as part
# of each per-format build target below, alongside the byte cap.
NAMED_EXPORTS := serveStaticGit

ALL := $(MJS_DST) $(CJS_DST)

####

all: $(ALL)

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	cd .. && node --input-type=module    -e 'const m = await import("./dist/serve-static-git.mjs"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)
	@ls -l $@
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/serve-static-git.cjs"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)
	@ls -l $@
	@echo ""

####

# Verify that the externalized `mime` dep exposes the API surface that
# lib/index.ts consumes, under both CJS `require()` and ESM `import`.
# This is what catches the mime v4 ESM-only regression: the bundle
# does `var mime = require('mime'); mime.getType(...)`, and `require()`
# of an ESM module returns the namespace object, leaving `getType`
# undefined at runtime. The check fails with a clear message before
# the broken bundle reaches a consumer.
MIME_API := getType

test_mime:
	cd .. && node --input-type=commonjs -e 'const m = require("mime"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing mime CJS API:", k); process.exit(1); } console.log("mime CJS API OK:", k); }' $(MIME_API)
	cd .. && node --input-type=module    -e 'const m = (await import("mime")).default; for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing mime ESM API:", k); process.exit(1); } console.log("mime ESM API OK:", k); }' $(MIME_API)

# Build, type-check, smoke the runtime deps, and run the node:test
# suite against the source. The signed/unsigned fixture matrix lives
# under test/test-prepare.sh.
test: all test_mime
	../node_modules/.bin/tsc --noEmit
	cd .. && rm -rf repo/ && bash test/test-prepare.sh
	cd .. && node --test test/*.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test test_mime
