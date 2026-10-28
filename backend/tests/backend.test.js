import request from "supertest";
import { createApp } from "../app.js";
const app = createApp();
async function runAllTests() {
  console.log("========================================================");
  console.log("\u{1F680} RUNNING DEVELOPER ARCADE BACKEND TEST SUITE");
  console.log("========================================================\n");
  let passed = 0;
  let failed = 0;
  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`  \u2705 PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  \u274C FAIL: ${desc}`);
      console.error(`     Error: ${err.message}
`);
      failed++;
    }
  }
  console.log("[1/7] Testing Authentication & Security...");
  await assert("Rejects GET /api/users/me without Bearer token (401)", async () => {
    const res = await request(app).get("/api/users/me");
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.body.code !== "AUTH_TOKEN_MISSING") throw new Error(`Expected AUTH_TOKEN_MISSING code, got ${res.body.code}`);
  });
  await assert("Rejects PATCH /api/users/me with malformed token (401)", async () => {
    const res = await request(app).patch("/api/users/me").set("Authorization", "Bearer invalid_garbage_token").send({ displayName: "Hacker" });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
  await assert("Allows authenticated user with valid token to retrieve profile", async () => {
    const res = await request(app).get("/api/users/me").set("Authorization", "Bearer mock_token_pilot_alpha_1");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.user || !res.body.user.displayName) throw new Error("Missing user payload");
  });
  await assert("Allows authenticated user to update allowed profile fields", async () => {
    const res = await request(app).patch("/api/users/me").set("Authorization", "Bearer mock_token_pilot_alpha_1").send({ title: "Lead Systems Architect", ringColor: "gold" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.user.title !== "Lead Systems Architect") throw new Error("Title update failed");
    if (res.body.user.ringColor !== "gold") throw new Error("Ring color update failed");
  });
  console.log("\n[2/7] Testing Games Configuration & Metadata...");
  await assert("GET /api/games returns all 15 mini-games with rule specifications", async () => {
    const res = await request(app).get("/api/games");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.count !== 15) throw new Error(`Expected 15 games, found ${res.body.count}`);
    const reaction = res.body.games.find((g) => g.id === "reaction-test");
    if (reaction.metricDirection !== "lower") throw new Error("reaction-test must have metricDirection: lower");
    const snake = res.body.games.find((g) => g.id === "snake");
    if (snake.metricDirection !== "higher") throw new Error("snake must have metricDirection: higher");
  });
  console.log("\n[3/7] Testing Idempotency & Duplicate Prevention...");
  const testKey = "idem_key_" + Date.now() + "_xyz";
  await assert("Accepts initial session submission with unique idempotencyKey (201)", async () => {
    const res = await request(app).post("/api/sessions").set("Authorization", "Bearer mock_token_pilot_idempotent_1").send({
      idempotencyKey: testKey,
      gameId: "snake",
      score: 120,
      durationSeconds: 45,
      difficulty: "Standard"
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    if (res.body.isDuplicate !== false) throw new Error("Expected isDuplicate to be false on first submission");
    if (res.body.xpAwarded <= 0) throw new Error("Expected positive server-awarded XP");
  });
  await assert("Idempotent retry with identical key returns cached session without re-awarding XP", async () => {
    const res = await request(app).post("/api/sessions").set("Authorization", "Bearer mock_token_pilot_idempotent_1").send({
      idempotencyKey: testKey,
      gameId: "snake",
      score: 120,
      durationSeconds: 45,
      difficulty: "Standard"
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.isDuplicate !== true) throw new Error("Expected isDuplicate: true");
  });
  console.log("\n[4/7] Testing Anti-Cheat & Boundary Validation...");
  await assert("Rejects impossible reaction latency (< 80ms)", async () => {
    const res = await request(app).post("/api/sessions").set("Authorization", "Bearer mock_token_pilot_anticheat_1").send({
      idempotencyKey: "idem_reaction_bot_" + Date.now(),
      gameId: "reaction-test",
      score: 12,
      // Impossible 12ms human reaction
      durationSeconds: 15
    });
    if (res.body.session.validationStatus !== "rejected") {
      throw new Error(`Expected validationStatus: rejected, got ${res.body.session.validationStatus}`);
    }
    if (res.body.xpAwarded !== 0) throw new Error("Rejected session must not receive XP");
  });
  await assert("Rejects scores exceeding max threshold", async () => {
    const res = await request(app).post("/api/sessions").set("Authorization", "Bearer mock_token_pilot_anticheat_2").send({
      idempotencyKey: "idem_overflow_" + Date.now(),
      gameId: "hyper-pong",
      score: 9999,
      // Max allowed is 50 in hyper-pong
      durationSeconds: 30
    });
    if (res.body.session.validationStatus !== "rejected") {
      throw new Error("Expected validationStatus: rejected");
    }
  });
  console.log("\n[5/7] Testing Lower-is-Better Record Logic...");
  const pilotId = "mock_token_reflex_pro_" + Date.now();
  await assert("Records lower score as personal best for reaction-test", async () => {
    const res1 = await request(app).post("/api/sessions").set("Authorization", `Bearer ${pilotId}`).send({
      idempotencyKey: "idem_rx_1_" + Date.now(),
      gameId: "reaction-test",
      score: 250,
      durationSeconds: 10
    });
    if (!res1.body.isNewPersonalBest) throw new Error("First run should be marked as personal best");
    const res2 = await request(app).post("/api/sessions").set("Authorization", `Bearer ${pilotId}`).send({
      idempotencyKey: "idem_rx_2_" + Date.now(),
      gameId: "reaction-test",
      score: 190,
      durationSeconds: 10
    });
    if (!res2.body.isNewPersonalBest) throw new Error("190ms is faster than 250ms, should be new personal best");
    const res3 = await request(app).post("/api/sessions").set("Authorization", `Bearer ${pilotId}`).send({
      idempotencyKey: "idem_rx_3_" + Date.now(),
      gameId: "reaction-test",
      score: 280,
      durationSeconds: 10
    });
    if (res3.body.isNewPersonalBest) throw new Error("280ms is worse than 190ms, should NOT be personal best");
  });
  console.log("\n[6/7] Testing Pagination & Query Limits...");
  await assert("GET /api/sessions supports page and limit pagination", async () => {
    const res = await request(app).get("/api/sessions?page=1&limit=3");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.limit !== 3) throw new Error(`Expected limit: 3, got ${res.body.limit}`);
    if (!Array.isArray(res.body.sessions)) throw new Error("Expected sessions array");
  });
  await assert("GET /api/leaderboards/:gameId returns paginated ranked standings", async () => {
    const res = await request(app).get("/api/leaderboards/snake?page=1&limit=5");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.leaderboards)) throw new Error("Expected leaderboards array");
  });
  console.log("\n[7/7] Testing Concurrent Score Submissions...");
  await assert("Handles multiple simultaneous session submissions safely", async () => {
    const concurrentCount = 5;
    const promises = Array.from({ length: concurrentCount }).map(
      (_, i) => request(app).post("/api/sessions").set("Authorization", "Bearer mock_token_concurrent_user").send({
        idempotencyKey: `idem_concurrent_${Date.now()}_${i}_${Math.random()}`,
        gameId: "neon-maze",
        score: 300 + i * 50,
        durationSeconds: 20 + i
      })
    );
    const results = await Promise.all(promises);
    for (const res of results) {
      if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
      if (res.body.session.validationStatus !== "verified") throw new Error("Expected verified session");
    }
  });
  console.log("\n========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("========================================================\n");
  if (failed > 0) {
    process.exit(1);
  }
}
export {
  runAllTests
};
