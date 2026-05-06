SRC   := $(wildcard ../lib/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)

MJS_DST := ../dist/serve-static-git.mjs
CJS_DST := ../dist/serve-static-git.cjs

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts

# The middleware itself is small (~3 KB). If it gets significantly larger,
# it might indicate an accidental inclusion of an external dependency or
# a Node.js built-in.
MAX_BYTES := 10000

# Documentation-specified named exports that must be verified in the bundles.
NAMED_EXPORTS := serveStaticGit

# API surface of the externalized `mime` dep that lib/index.ts consumes.
# Kept as a smoke-time contract check to catch ESM-only regressions
# (e.g. mime v4 returning a namespace from `require()` with no `getType`).
MIME_API := getType

ALL := $(MJS_DST) $(CJS_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via `make smoke`.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate that fails loudly when type-strip is unavailable; consumed by `all`
# and by `npm prepack` to refuse packaging on a non-buildable runtime.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ] || { echo "ERROR: Node type-strip required (Node 22.18+); BUILDABLE=$(BUILDABLE)" >&2; exit 1; }

# Inverse gate used by `npm prepare` to short-circuit on a non-buildable
# runtime so consumer install on Node 20 silently skips build/test.
is-not-buildable:
	@ [ "$(BUILDABLE)" = "NO" ]
$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

# Verify that the externalized `mime` dep exposes the API surface that
# lib/index.ts consumes, under both CJS `require()` and ESM `import`.
# This is what catches the mime v4 ESM-only regression: the bundle
# does `var mime = require('mime'); mime.getType(...)`, and `require()`
# of an ESM module returns the namespace object, leaving `getType`
# undefined at runtime. The check fails with a clear message before
# the broken bundle reaches a consumer.
test_mime:
	cd .. && node --input-type=commonjs -e 'const m = require("mime"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing mime CJS API:", k); process.exit(1); } console.log("mime CJS API OK:", k); }' $(MIME_API)
	cd .. && node --input-type=module    -e 'const m = (await import("mime")).default; for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing mime ESM API:", k); process.exit(1); } console.log("mime ESM API OK:", k); }' $(MIME_API)

# Verify the bundles by importing/requiring the package itself.
# This ensures the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs test_mime

# MJS smoke test via public entrypoint.
smoke-mjs: $(MJS_DST)
	cd .. && node --input-type=module -e 'const m = await import("serve-static-git"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

# CJS smoke test via public entrypoint.
smoke-cjs: $(CJS_DST)
	cd .. && node --input-type=commonjs -e 'const m = require("serve-static-git"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

####

# Build, run smoke tests, and conditionally run full tests (tsc and node:test).
# 1. Skip on Node.js 20 (already EOL).
# 2. Skip during 'npm install' (npm_command=install) to prevent redundant tests in CI and local dev.
# Informative messages are shown when skipping.
test: all smoke $(TYPES)
	@ [ "$$npm_command" != "install" ] || echo "npm install detected: skipping full tests."
	@ [ "$$npm_command" = "install" ] || $(MAKE) test-ts

# Actual test commands requiring Node.js 22+.
# The signed/unsigned fixture matrix lives under test/test-prepare.sh.
test-ts:
	../node_modules/.bin/tsc --noEmit
	cd .. && rm -rf repo/ && bash test/test-prepare.sh
	cd .. && node --test test/*.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test test_mime smoke smoke-mjs smoke-cjs test-ts is-buildable is-not-buildable
