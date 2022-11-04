#!/usr/bin/env node

import jsdom from "jsdom";
import fetch from "node-fetch";
import moment from "moment";
import iconv from "iconv-lite";
import { SekkiNames } from "@Src/models";

const { JSDOM } = jsdom;

interface KV {
  key: string;
  value: string;
}

const getSekkiFromYear = async (year: string): Promise<KV[] | null> => {
  const twoDigitYear = year.slice(2, 4);
  const res = await fetch(
    `https://eco.mtk.nao.ac.jp/koyomi/yoko/${year}/rekiyou${twoDigitYear}2.html`
  );
  if (res.status != 200) {
    return null;
  }

  const html = iconv.decode(Buffer.from(await res.arrayBuffer()), "cp932");
  const document = new JSDOM(html).window.document;
  const raws = document.querySelectorAll("tr");

  let result = new Array(0);
  raws.forEach((raw) => {
    const tds = raw.querySelectorAll("td");
    if (tds.length == 0) {
      return;
    }
    const sekkiName = SekkiNames.filter((i) => {
      return i.ja == tds[0].textContent;
    });
    if (sekkiName.length > 0) {
      moment.locale("ja");
      const date = moment(
        `${year}年` + tds[2].textContent + tds[3].textContent,
        "YYYY年M月DD日H時mm分"
      );
      result.push({
        key: `${year}:` + sekkiName[0].ch,
        value: date.unix().toString(),
      });
    }
  });
  return result;
};

(async () => {
  let result = new Array(0);
  let year = "2004";
  while (true) {
    const sekkis = await getSekkiFromYear(year);
    if (sekkis == null) {
      break;
    }
    result = result.concat(sekkis);
    year = (parseInt(year) + 1).toString();
  }
  console.log(JSON.stringify(result));
})();
