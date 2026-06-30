import { NextRequest, NextResponse } from "next/server";

type RedisCommand = [string, ...Array<string | number>];

async function readStatsPayload(req: NextRequest) {
  try {
    return await req.json() as {
      uuid?: string;
      isNewVisit?: boolean;
      projectSlug?: string;
    };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uuid, isNewVisit, projectSlug } = await readStatsPayload(req);

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // 若未設定環境變數，直接返回 0，不虛構任何數據
    if (!url || !token) {
      return NextResponse.json({
        pv: 0,
        active: 0,
        projectPvs: {},
        fallback: true
      });
    }

    const cleanUuid = (uuid || "anonymous").replace(/[^a-zA-Z0-9-]/g, "");

    const commands: RedisCommand[] = [];
    // ponytail: ZADD/ZREMRANGEBYSCORE/ZCARD instead of KEYS — KEYS is O(n) and blocks Redis
    const now = Date.now();
    const cutoff = now - 60_000;

    if (isNewVisit) {
      commands.push(["INCR", "stats:pv"]);
    }

    commands.push(["ZADD", "stats:active:zset", String(now), cleanUuid]);
    commands.push(["ZREMRANGEBYSCORE", "stats:active:zset", "0", String(cutoff)]);

    if (projectSlug) {
      const cleanSlug = projectSlug.replace(/[^a-zA-Z0-9-]/g, "");
      commands.push(["HINCRBY", "stats:projects:pv", cleanSlug, "1"]);
    }

    commands.push(["GET", "stats:pv"]);
    commands.push(["ZCARD", "stats:active:zset"]);
    commands.push(["HGETALL", "stats:projects:pv"]);

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commands),
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("KV API error");
    }

    const results = await res.json();

    let idx = 0;
    if (isNewVisit) idx++; // INCR stats:pv
    idx++; // ZADD stats:active:zset
    idx++; // ZREMRANGEBYSCORE stats:active:zset
    if (projectSlug) idx++; // HINCRBY stats:projects:pv

    const pv = results[idx]?.result ?? 0;
    idx++;
    const activeCount = results[idx]?.result ?? 1;
    idx++;
    const rawProjectPvs = results[idx]?.result ?? [];

    const projectPvs: Record<string, number> = {};
    if (Array.isArray(rawProjectPvs)) {
      // ponytail: HGETALL in Upstash pipeline returns flat array [k,v,k,v,...]
      for (let i = 0; i < rawProjectPvs.length - 1; i += 2) {
        projectPvs[rawProjectPvs[i]] = Number(rawProjectPvs[i + 1]);
      }
    } else if (rawProjectPvs && typeof rawProjectPvs === "object") {
      Object.entries(rawProjectPvs).forEach(([key, val]) => {
        projectPvs[key] = Number(val);
      });
    }

    return NextResponse.json({
      pv: Number(pv),
      active: Math.max(1, Number(activeCount)),
      projectPvs,
      fallback: false
    });
  } catch (error) {
    console.error("Stats API error:", error);
    // 發生錯誤時返回 0
    return NextResponse.json({
      pv: 0,
      active: 0,
      projectPvs: {},
      fallback: true
    });
  }
}
