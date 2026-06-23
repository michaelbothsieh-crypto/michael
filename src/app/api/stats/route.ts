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

    // 1. 只有首次訪問才遞增全站 PV
    if (isNewVisit) {
      commands.push(["INCR", "stats:pv"]);
    }

    // 2. 登錄/更新線上狀態
    commands.push(["SET", `stats:active:${cleanUuid}`, "1", "EX", "60"]);

    // 3. 若有傳入 projectSlug，遞增該專案的點閱數
    if (projectSlug) {
      const cleanSlug = projectSlug.replace(/[^a-zA-Z0-9-]/g, "");
      commands.push(["HINCRBY", "stats:projects:pv", cleanSlug, "1"]);
    }

    // 4. 取得總到訪次數
    commands.push(["GET", "stats:pv"]);

    // 5. 取得線上活躍 keys
    commands.push(["KEYS", "stats:active:*"]);

    // 6. 取得所有專案的點閱量
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

    // 根據發送的指令順序，動態計算解析索引
    let idx = 0;
    if (isNewVisit) idx++; // INCR stats:pv
    idx++; // SET stats:active
    if (projectSlug) idx++; // HINCRBY stats:projects:pv

    const pv = results[idx]?.result ?? 0;
    idx++;
    const activeKeys = results[idx]?.result ?? [];
    idx++;
    const rawProjectPvs = results[idx]?.result ?? {};

    const projectPvs: Record<string, number> = {};
    if (rawProjectPvs && typeof rawProjectPvs === "object") {
      Object.entries(rawProjectPvs).forEach(([key, val]) => {
        projectPvs[key] = Number(val);
      });
    }

    return NextResponse.json({
      pv: Number(pv),
      active: Math.max(1, activeKeys.length),
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
