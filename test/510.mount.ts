import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import express from "express";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const app = express();

    app.use("/mount/", serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
        dotfiles: "deny",
    }))

    const request = axiosist(app)

    it(`/mount/`, async () => {
        await request.get("/mount/foo.html").then(res => assert.match(String(res.data), /Foo/))
        await request.get("/mount/bar/bar.css").then(res => assert.match(String(res.data), /Bar/))
        await request.get("/mount/bar/buz/buz.js").then(res => assert.match(String(res.data), /Buz/))
        await request.get("/mount/not-found.html").then(res => assert.equal(res.status, 404))
        await request.get("/mount/.htaccess").then(res => assert.equal(res.status, 403))

        await request.get("/mount/bar/buz", {maxRedirects: 0}).then(res => {
            assert.match(res.headers.location, /\/mount\/bar\/buz\/$/)
        })
    })
})