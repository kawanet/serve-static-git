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

    {
        const host = "main.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html").set("host", host).then(res => assert.match(res.text, /Foo/))
            await request.get("/bar/bar.css").set("host", host).then(res => assert.match(res.text, /Bar/))
            await request.get("/bar/buz/buz.js").set("host", host).then(res => assert.match(res.text, /Buz/))
        })
    }

    {
        const host = "upper.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html").set("host", host).then(res => assert.match(res.text, /FOO/))
            await request.get("/bar/bar.css").set("host", host).then(res => assert.match(res.text, /BAR/))
            await request.get("/bar/buz/buz.js").set("host", host).then(res => assert.match(res.text, /BUZ/))
        })
    }
})