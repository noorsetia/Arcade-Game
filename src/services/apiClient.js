const OFFLINE_QUEUE_KEY = "arcade_offline_queue_v1";
const AUTH_TOKEN_KEY = "noor_arcade_token_v2";
class ArcadeApiClient {
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  syncListeners = [];
  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.flushOfflineQueue();
      });
      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
      setTimeout(() => this.flushOfflineQueue(), 2e3);
    }
  }
  subscribeSync(listener) {
    this.syncListeners.push(listener);
    listener({ isSyncing: false, queueCount: this.getOfflineQueue().length });
    return () => {
      const idx = this.syncListeners.indexOf(listener);
      if (idx >= 0) this.syncListeners.splice(idx, 1);
    };
  }
  notifySync(isSyncing) {
    const queueCount = this.getOfflineQueue().length;
    this.syncListeners.forEach((l) => l({ isSyncing, queueCount }));
  }
  getAuthHeader() {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
    }
    return {};
  }
  getOfflineQueue() {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  setOfflineQueue(queue) {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {
    }
  }
  /**
   * Submits a completed game session to the backend with idempotency and retry.
   */
  async submitSession(payload) {
    const idempotencyKey = payload.idempotencyKey || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const submissionPayload = {
      ...payload,
      idempotencyKey,
      clientSubmittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!this.isOnline) {
      this.enqueueOfflineSession(submissionPayload);
      return {
        success: true,
        isServerConfirmed: false,
        queuedForSync: true,
        session: submissionPayload
      };
    }
    try {
      const res = await this.fetchWithRetry("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader()
        },
        body: JSON.stringify(submissionPayload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server rejected session");
      }
      return {
        success: true,
        isServerConfirmed: true,
        isDuplicate: data.isDuplicate,
        session: data.session,
        isNewPersonalBest: data.isNewPersonalBest,
        xpAwarded: data.xpAwarded,
        newAchievements: data.newAchievements,
        userStats: data.userStats
      };
    } catch (err) {
      console.warn("[ApiClient] Submission failed or offline, saving to local retry queue:", err.message);
      this.enqueueOfflineSession(submissionPayload);
      return {
        success: true,
        isServerConfirmed: false,
        queuedForSync: true,
        error: err.message,
        session: submissionPayload
      };
    }
  }
  enqueueOfflineSession(item) {
    const queue = this.getOfflineQueue();
    if (!queue.some((q) => q.idempotencyKey === item.idempotencyKey)) {
      queue.push(item);
      this.setOfflineQueue(queue);
      this.notifySync(false);
    }
  }
  /**
   * Flushes queued sessions in the background
   */
  async flushOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;
    this.notifySync(true);
    const remaining = [];
    for (const item of queue) {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeader()
          },
          body: JSON.stringify(item)
        });
        if (!res.ok) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }
    this.setOfflineQueue(remaining);
    this.notifySync(false);
  }
  /**
   * Retries network requests with exponential backoff
   */
  async fetchWithRetry(url, options, retries = 2, delayMs = 600) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.fetchWithRetry(url, options, retries - 1, delayMs * 2);
    }
  }
  async getMe() {
    const res = await fetch("/api/users/me", {
      headers: { ...this.getAuthHeader() }
    });
    return res.json();
  }
  async patchMe(updates) {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  }
  async getLeaderboards(gameId = "all", page = 1, limit = 20) {
    const res = await fetch(`/api/leaderboards/${gameId}?page=${page}&limit=${limit}`);
    return res.json();
  }
  async getDailyChallenge() {
    const res = await fetch("/api/challenges/daily");
    return res.json();
  }
  async completeDailyChallenge(challengeId, payload) {
    const res = await fetch(`/api/challenges/${challengeId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
}
export const arcadeApi = new ArcadeApiClient();
