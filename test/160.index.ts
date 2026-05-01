import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import * as http from "node:http";
import supertest from "supertest";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";
import type {SSG} from "../types/serve-static-git.d.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "index">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            index: options.index,
        })

        return supertest(http.createServer((req, res) => serve(req, res, finalhandler(req, res))))
    };

    it(`index: undefined`, async () => {
        const request = makeRequest({index: undefined})
        await request.get("/bar/buz/index.html").then(res => assert.match(res.text, /Index/, "/bar/buz/index.html"))
        await request.get("/bar/buz/").then(res => assert.match(res.text, /Index/, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.equal(res.status, 404, "/"))
    })

    it(`index: "foo.html"`, async () => {
        const request = makeRequest({index: "foo.html"})
        await request.get("/bar/buz/").then(res => assert.equal(res.status, 404, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.match(res.text, /Foo/, "/"))
    })

    it(`index: ["index.html", "foo.html"]`, async () => {
        const request = makeRequest({index: ["index.html", "foo.html"]})
        await request.get("/bar/buz/").then(res => assert.match(res.text, /Index/, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.match(res.text, /Foo/, "/"))

        await request.get("/?_=1638157880").then(res => assert.match(res.text, /Foo/, "/?_=1638157880"))
    })
})