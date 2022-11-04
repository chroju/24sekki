import { Hono } from "hono";
import { getSekkiList, getSekki, Sekki, SekkiNames } from "./models";

export interface Env {
  SEKKI: KVNamespace;
  YEAR: string;
  TERM: string;
}

const sekki = new Hono<{ Bindings: Env }>();

sekki.get("/", async (c) => {
  const sekkis = await getSekkiList(c.env.SEKKI);
  return c.json({ data: sekkis });
});

sekki.get("/current", async (c) => {
  const now = new Date();
  const thisYear = now.getFullYear();

  let sekkis = await getSekkiList(c.env.SEKKI, `${thisYear}`);
  const lastSekki = await getSekki(
    c.env.SEKKI,
    `${thisYear - 1}:${SekkiNames[23].ch}`
  );
  const nextSekki = await getSekki(
    c.env.SEKKI,
    `${thisYear + 1}:${SekkiNames[0].ch}`
  );
  if (lastSekki != null && nextSekki != null) {
    sekkis = sekkis.concat([lastSekki, nextSekki]);
  }
  sekkis.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  let prev: Sekki = sekkis[0];
  let next: Sekki = sekkis[1];
  for (let i = 1; i < sekkis.length; i++) {
    if (next.datetime.getTime() > now.getTime()) {
      break;
    }
    prev = sekkis[i];
    next = sekkis[i + 1];
  }

  return c.json({
    data: {
      prev: prev,
      next: next,
    },
  });
});

sekki.get("/:year", async (c) => {
  const year = c.req.param("year");
  if (parseInt(year) < 2003) {
    return c.json({ error: "year must be after 2003" }, 400);
  }
  const sekkis = await getSekkiList(c.env.SEKKI, `${year}:`);
  const status = sekkis.length == 0 ? 404 : 200;
  return c.json({ data: sekkis }, status);
});

sekki.get("/:year/:term", async (c) => {
  const year = c.req.param("year");
  if (parseInt(year) < 2000) {
    return c.json({ error: "year must be after 2003" }, 400);
  }
  const term = c.req.param("term");
  const sekki = await getSekki(c.env.SEKKI, `${year}:${term}`);
  const status = sekki == null ? 404 : 200;
  return c.json({ data: sekki == null ? [] : [sekki] }, status);
});

export { sekki };
