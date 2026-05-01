import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";
import type {SSG} from "../types/serve-static-git.d.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "root">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: options.root
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`root: "htdocs"`, async () => {
        const request = makeRequest({root: "htdocs"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
    })

    it(`root: "htdocs/bar"`, async () => {
        const request = makeRequest({root: "htdocs/bar"})
        await request.get("/bar.css").then(res => assert.equal(res.status, 200))
        await request.get("/buz/buz.js").then(res => assert.equal(res.status, 200))
    })

    it(`root: "htdocs/bar/buz"`, async () => {
        const request = makeRequest({root: "htdocs/bar/buz"})
        await request.get("/buz.js").then(res => assert.equal(res.status, 200))
    })

    it(`root: undefined`, async () => {
        const request = makeRequest({root: undefined})
        await request.get("/htdocs/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/htdocs/bar/bar.css").then(res => assert.equal(res.status, 200))
    })
})