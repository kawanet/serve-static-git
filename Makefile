#!/usr/bin/env bash -c make

all: lib/index.js

clean:
	/bin/rm -fr lib/*.js test/*.js repo/

test: all mocha

./node_modules/.bin/%:
	npm install

lib/%.js: lib/%.ts ./node_modules/.bin/tsc
	./node_modules/.bin/tsc -p .

test/%.js: test/%.ts ./node_modules/.bin/tsc
	./node_modules/.bin/tsc -p .

mocha: test/100.serve.js ./node_modules/.bin/mocha repo/bare1.git
	./node_modules/.bin/mocha test

repo/bare1.git:
	sh ./test/test-prepare.sh

.PHONY: all clean test
