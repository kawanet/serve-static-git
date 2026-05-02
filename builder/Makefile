SRC := $(wildcard ../lib/*.ts ../types/*.ts)
BUILDER_SRC := $(wildcard ./*.ts)

PKG_DST := ../dist/package.json
MJS_DST := ../dist/serve-static-git.mjs
CJS_DST := ../dist/serve-static-git.cjs

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts

# The middleware itself is small (~3 KB). Anything noticeably larger
# means an accidental bundling of an external dependency or a Node
# built-in — fail the build so it cannot slip in.
MAX_BYTES := 10000

# Every named export the package documents must survive the round trip
# through both CJS and ESM bundles. List them once and assert in both
# smoke checks below.
NAMED_EXPORTS := serveStaticGit

ALL := $(MJS_DST) $(CJS_DST) $(PKG_DST)

####

all: $(ALL)

$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

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

####

# Build, type-check, smoke-check that both bundles expose every named
# export, and run the node:test suite against the source. The
# signed/unsigned fixture matrix lives under test/test-prepare.sh.
test: all
	../node_modules/.bin/tsc --noEmit
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/serve-static-git.cjs"); for (const k of "$(NAMED_EXPORTS)".split(" ")) if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS smoke OK")'
	cd .. && node --input-type=module    -e 'const m = await import("./dist/serve-static-git.mjs"); for (const k of "$(NAMED_EXPORTS)".split(" ")) if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS smoke OK")'
	cd .. && rm -rf repo/ && bash test/test-prepare.sh
	cd .. && node --test test/*.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test
