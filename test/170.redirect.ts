import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import * as http from "node:http";
import supertest from "supertest";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
    })

    const request = supertest(http.createServer((req, res) => serve(req, res, finalhandler(req, res))))

    it(`301 without following`, async () => {
        await request.get("/bar/buz").then(res => {
            assert.equal(res.status, 301, "/bar/buz")
            assert.match(res.headers.location, /\/bar\/buz\/$/)
        })

        await request.get("/bar/buz?_=1638157880").then(res => {
            assert.equal(res.status, 301, "/bar/buz?_=1638157880")
            assert.match(res.headers.location, /\/bar\/buz\/\?_=1638157880$/)
        })
    })

    it(`follow one redirect`, async () => {
        await request.get("/bar/buz").redirects(1).then(res => {
            assert.equal(res.status, 200, "/bar/buz")
            assert.match(res.text, /Index/)
        })
    })
})