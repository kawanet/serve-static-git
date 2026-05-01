import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {

    ["repo/loose1/.git", "repo/packed1/.git", "repo/bare1.git"].forEach(test)

    function test(repo: string) {
        it(`repo: "${repo}"`, async () => {
            const serve = serveStaticGit({
                repo: `${BASE}/${repo}`,
                root: `htdocs`,
            })
            const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))
            await request.get("/foo.html").then(res => assert.equal(res.status, 200))
            await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
            await request.get("/bar/buz/buz.js").then(res => assert.equal(res.status, 200))
            await request.get(`/not-found.html`).then(res => assert.equal(res.status, 404))
        })
    }
})