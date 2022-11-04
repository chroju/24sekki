export interface SekkiName {
  ch: string;
  ja: string;
}

export interface Sekki {
  term: SekkiName;
  year: number;
  datetime: Date;
}

export const SekkiNames: SekkiName[] = [
  { ch: "lichun", ja: "立春" },
  { ch: "yushui", ja: "雨水" },
  { ch: "jingzhe", ja: "啓蟄" },
  { ch: "chufen", ja: "春分" },
  { ch: "qingming", ja: "清明" },
  { ch: "guyu", ja: "穀雨" },
  { ch: "lixia", ja: "立夏" },
  { ch: "xiaoman", ja: "小満" },
  { ch: "mangzhong", ja: "芒種" },
  { ch: "xiazhi", ja: "夏至" },
  { ch: "xiaoshu", ja: "小暑" },
  { ch: "dashu", ja: "大暑" },
  { ch: "liqiu", ja: "立秋" },
  { ch: "chushu", ja: "処暑" },
  { ch: "bailu", ja: "白露" },
  { ch: "qiufen", ja: "秋分" },
  { ch: "hanlu", ja: "寒露" },
  { ch: "shuangjiang", ja: "霜降" },
  { ch: "lidong", ja: "立冬" },
  { ch: "xiaoxue", ja: "小雪" },
  { ch: "daxue", ja: "大雪" },
  { ch: "dongzhi", ja: "冬至" },
  { ch: "xiaohan", ja: "小寒" },
  { ch: "dahan", ja: "大寒" },
];

export const getSekkiList = async (
  KV: KVNamespace,
  prefix?: string,
  limit?: number
): Promise<Sekki[]> => {
  if (limit == null) {
    limit = 50;
  }
  const list = await KV.list({ prefix: prefix, limit: limit });

  const sekkis: Sekki[] = [];
  for (const key of list.keys) {
    const sekki = await getSekki(KV, key.name);
    if (sekki != null) {
      sekkis.push(sekki);
    }
  }
  return sekkis;
};

export const getSekki = async (
  KV: KVNamespace,
  key: string
): Promise<Sekki | null> => {
  const datetime = await KV.get(key);
  if (datetime == null) {
    return null;
  }
  const year = key.split(":")[0];
  const chineseName = key.split(":")[1];
  const name = SekkiNames.filter((i) => {
    return i.ch == chineseName;
  })[0];
  const sekkiName: SekkiName = {
    ch: name.ch,
    ja: name.ja,
  };
  const result: Sekki = {
    term: sekkiName,
    year: Number(year),
    datetime: new Date(Number(datetime) * 1000),
  };
  return result;
};
