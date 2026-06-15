import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { uuid } = await req.json();

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // 若未設定環境變數，則提供平滑降級的模擬數據
    if (!url || !token) {
      return NextResponse.json({
        pv: 1342,
        active: 3,
        fallback: true
      });
    }

    const cleanUuid = (uuid || "anonymous").replace(/[^a-zA-Z0-9-]/g, "");

    // 使用 Upstash/Vercel KV REST Pipeline，一次發送所有指令
    const commands = [
      ["INCR", "stats:pv"],
      ["SET", `stats:active:${cleanUuid}`, "1", "EX", "60"],
      ["GET", "stats:pv"],
      ["KEYS", "stats:active:*"]
    ];

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
    // pipeline 返回格式: [{result: 1}, {result: "OK"}, {result: 100}, {result: ["stats:active:xxx"]}]
    const pv = results[2]?.result ?? 0;
    const activeKeys = results[3]?.result ?? [];
    const activeCount = Array.isArray(activeKeys) ? activeKeys.length : 1;

    return NextResponse.json({
      pv: Number(pv),
      active: Math.max(1, activeCount),
      fallback: false
    });
  } catch (error) {
    console.error("Stats API error:", error);
    // 發生錯誤時的平滑降級
    return NextResponse.json({
      pv: 1342,
      active: 3,
      fallback: true
    });
  }
}
