import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
    })

    const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))

    {
        const host = "main.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html", {headers: {host}}).then(res => assert.match(String(res.data), /Foo/))
            await request.get("/bar/bar.css", {headers: {host}}).then(res => assert.match(String(res.data), /Bar/))
            await request.get("/bar/buz/buz.js", {headers: {host}}).then(res => assert.match(String(res.data), /Buz/))
        })
    }

    {
        const host = "upper.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html", {headers: {host}}).then(res => assert.match(String(res.data), /FOO/))
            await request.get("/bar/bar.css", {headers: {host}}).then(res => assert.match(String(res.data), /BAR/))
            await request.get("/bar/buz/buz.js", {headers: {host}}).then(res => assert.match(String(res.data), /BUZ/))
        })
    }
})