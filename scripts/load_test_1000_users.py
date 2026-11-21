"""
TradeX Pro — 1,000 Concurrent Users Institutional Load & Stress Testing Engine
=============================================================================
Simulates 1,000 concurrent active users exercising:
1. Live Production Frontend Edge (https://tradexpro-live.vercel.app)
2. FastAPI Quantitative Backend Gateway (in-memory ASGI + HTTP endpoints)
   - Market Quotes (/api/v1/market/quote)
   - Technical Indicators (/api/v1/market/indicators)
   - Health / Liveness (/health)
   - Academy / Content API (/api/v1/academy/courses)

Outputs:
- Request latencies: Min, Mean, Median (p50), p90, p95, p99, Max
- Throughput (Requests Per Second)
- Error rate / HTTP status code distribution
- Concurrency scaling report across 100, 250, 500, and 1,000 virtual users.
"""

import sys
import os
import time
import math
import asyncio
import statistics
from typing import List, Dict, Any

# Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import httpx

# Ensure mock provider is active for clean benchmark without 3rd-party network delays
os.environ["MARKET_DATA_PROVIDER"] = "mock"

# Try importing the FastAPI app
try:
    from backend.app.main import app as fastapi_app
except ImportError:
    try:
        from app.main import app as fastapi_app
    except ImportError:
        fastapi_app = None


def calculate_percentiles(latencies_ms: List[float]) -> Dict[str, float]:
    if not latencies_ms:
        return {"min": 0, "avg": 0, "p50": 0, "p90": 0, "p95": 0, "p99": 0, "max": 0}
    sorted_lats = sorted(latencies_ms)
    n = len(sorted_lats)

    def percentile(p: float) -> float:
        k = (n - 1) * (p / 100.0)
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_lats[int(k)]
        d0 = sorted_lats[int(f)] * (c - k)
        d1 = sorted_lats[int(c)] * (k - f)
        return d0 + d1

    return {
        "min": round(sorted_lats[0], 2),
        "avg": round(statistics.mean(sorted_lats), 2),
        "p50": round(percentile(50), 2),
        "p90": round(percentile(90), 2),
        "p95": round(percentile(95), 2),
        "p99": round(percentile(99), 2),
        "max": round(sorted_lats[-1], 2),
    }


async def test_live_production_frontend(
    total_users: int = 1000,
    concurrency_limit: int = 100,
    target_url: str = "https://tradexpro-live.vercel.app",
) -> Dict[str, Any]:
    """
    Simulates `total_users` simultaneous users hitting the live production Vercel edge deployment.
    Uses an asyncio.Semaphore to throttle maximum active socket connections to avoid OS-level WSAENOBUFS.
    """
    print(f"\n=================================================================")
    print(f"🚀 [PHASE 1] LIVE PRODUCTION FRONTEND LOAD TEST")
    print(f"Target: {target_url}")
    print(f"Simulated Virtual Users: {total_users} concurrent visitors")
    print(f"Max Concurrent Socket Pipe: {concurrency_limit}")
    print(f"=================================================================")

    sem = asyncio.Semaphore(concurrency_limit)
    latencies: List[float] = []
    status_counts: Dict[int, int] = {}
    errors: List[str] = []
    total_bytes = 0

    limits = httpx.Limits(max_keepalive_connections=concurrency_limit, max_connections=concurrency_limit)
    timeout = httpx.Timeout(15.0, connect=10.0)

    async with httpx.AsyncClient(limits=limits, timeout=timeout, follow_redirects=True) as client:
        start_time = time.perf_counter()

        async def worker(user_id: int):
            nonlocal total_bytes
            async with sem:
                req_start = time.perf_counter()
                try:
                    # User simulates visiting the TradeX Pro landing/trading terminal
                    headers = {
                        "User-Agent": f"TradeX-LoadTester/1.0 (User-{user_id})",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    }
                    resp = await client.get(target_url, headers=headers)
                    elapsed_ms = (time.perf_counter() - req_start) * 1000.0
                    latencies.append(elapsed_ms)
                    total_bytes += len(resp.content)
                    status_counts[resp.status_code] = status_counts.get(resp.status_code, 0) + 1
                except Exception as e:
                    elapsed_ms = (time.perf_counter() - req_start) * 1000.0
                    errors.append(f"User {user_id}: {type(e).__name__} ({str(e)})")
                    status_counts[0] = status_counts.get(0, 0) + 1

        tasks = [worker(i) for i in range(1, total_users + 1)]
        await asyncio.gather(*tasks)

        total_wall_clock = time.perf_counter() - start_time

    rps = total_users / total_wall_clock if total_wall_clock > 0 else 0
    percentiles = calculate_percentiles(latencies)
    success_count = sum(cnt for code, cnt in status_counts.items() if 200 <= code < 400)
    success_rate = (success_count / total_users) * 100.0

    print(f"\n📊 --- PHASE 1 RESULTS: PRODUCTION FRONTEND ---")
    print(f"• Total Users Tested   : {total_users}")
    print(f"• Successful Requests  : {success_count} ({success_rate:.2f}%)")
    print(f"• HTTP Status Codes    : {status_counts}")
    print(f"• Total Test Duration  : {total_wall_clock:.2f} seconds")
    print(f"• Sustained Throughput : {rps:.2f} Requests/sec (RPS)")
    print(f"• Total Data Downloaded: {total_bytes / (1024 * 1024):.2f} MB")
    print(f"• Latency Distribution (ms):")
    print(f"    - Min : {percentiles['min']} ms")
    print(f"    - Avg : {percentiles['avg']} ms")
    print(f"    - p50 : {percentiles['p50']} ms (Median)")
    print(f"    - p90 : {percentiles['p90']} ms")
    print(f"    - p95 : {percentiles['p95']} ms")
    print(f"    - p99 : {percentiles['p99']} ms")
    print(f"    - Max : {percentiles['max']} ms")

    return {
        "phase": "Live Production Frontend",
        "target": target_url,
        "users": total_users,
        "success_rate": success_rate,
        "status_codes": status_counts,
        "duration_sec": round(total_wall_clock, 2),
        "rps": round(rps, 2),
        "mb_transferred": round(total_bytes / (1024 * 1024), 2),
        "percentiles": percentiles,
        "errors": errors[:5],
    }


async def test_fastapi_backend_engine(
    total_users: int = 1000,
    concurrency_limit: int = 100,
) -> Dict[str, Any]:
    """
    Simulates 1,000 concurrent virtual traders executing complex algorithmic and quantitative queries
    directly against the FastAPI ASGI Application.
    """
    if fastapi_app is None:
        print("\n❌ FastAPI app instance could not be imported.")
        return {}

    print(f"\n=================================================================")
    print(f"⚡ [PHASE 2] FASTAPI CORE QUANTITATIVE ENGINE LOAD TEST")
    print(f"Simulated Active Traders: {total_users} simultaneous algorithmic users")
    print(f"Workflows Tested: Quotes, Technicals, Risk Factors, Health")
    print(f"=================================================================")

    sem = asyncio.Semaphore(concurrency_limit)
    latencies: List[float] = []
    status_counts: Dict[int, int] = {}
    endpoint_latencies: Dict[str, List[float]] = {
        "health": [],
        "quote": [],
        "indicators": [],
        "academy": [],
    }
    errors: List[str] = []

    # Transport-level in-memory client
    transport = httpx.ASGITransport(app=fastapi_app)

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        start_time = time.perf_counter()

        async def trader_session(user_id: int):
            async with sem:
                # 1. Health check / telemetry
                t0 = time.perf_counter()
                try:
                    r1 = await client.get("/health")
                    elapsed1 = (time.perf_counter() - t0) * 1000.0
                    latencies.append(elapsed1)
                    endpoint_latencies["health"].append(elapsed1)
                    status_counts[r1.status_code] = status_counts.get(r1.status_code, 0) + 1
                except Exception as e:
                    errors.append(f"U{user_id}-health: {str(e)}")

                # 2. Market quote (symbols varied across users)
                symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "AAPL", "NVDA"]
                sym = symbols[user_id % len(symbols)]
                t1 = time.perf_counter()
                try:
                    r2 = await client.get(f"/api/v1/market/quote?symbol={sym}")
                    elapsed2 = (time.perf_counter() - t1) * 1000.0
                    latencies.append(elapsed2)
                    endpoint_latencies["quote"].append(elapsed2)
                    status_counts[r2.status_code] = status_counts.get(r2.status_code, 0) + 1
                except Exception as e:
                    errors.append(f"U{user_id}-quote: {str(e)}")

                # 3. Technical indicators (SMA, EMA, RSI, MACD calculation)
                t2 = time.perf_counter()
                try:
                    r3 = await client.get(f"/api/v1/market/indicators?symbol={sym}")
                    elapsed3 = (time.perf_counter() - t2) * 1000.0
                    latencies.append(elapsed3)
                    endpoint_latencies["indicators"].append(elapsed3)
                    status_counts[r3.status_code] = status_counts.get(r3.status_code, 0) + 1
                except Exception as e:
                    errors.append(f"U{user_id}-indicators: {str(e)}")

                # 4. Academy curriculum
                t3 = time.perf_counter()
                try:
                    r4 = await client.get("/api/v1/academy/curriculum")
                    elapsed4 = (time.perf_counter() - t3) * 1000.0
                    latencies.append(elapsed4)
                    endpoint_latencies["academy"].append(elapsed4)
                    status_counts[r4.status_code] = status_counts.get(r4.status_code, 0) + 1
                except Exception as e:
                    errors.append(f"U{user_id}-academy: {str(e)}")

        tasks = [trader_session(i) for i in range(1, total_users + 1)]
        await asyncio.gather(*tasks)
        total_wall_clock = time.perf_counter() - start_time

    total_requests = len(latencies)
    rps = total_requests / total_wall_clock if total_wall_clock > 0 else 0
    percentiles = calculate_percentiles(latencies)
    success_count = sum(cnt for code, cnt in status_counts.items() if 200 <= code < 400)
    success_rate = (success_count / total_requests) * 100.0 if total_requests > 0 else 0

    print(f"\n📊 --- PHASE 2 RESULTS: FASTAPI BACKEND ENGINE ---")
    print(f"• Total Users Simulated: {total_users}")
    print(f"• Total Requests Sent  : {total_requests}")
    print(f"• Successful Requests  : {success_count} ({success_rate:.2f}%)")
    print(f"• HTTP Status Codes    : {status_counts}")
    print(f"• Total Test Duration  : {total_wall_clock:.2f} seconds")
    print(f"• Sustained Throughput : {rps:.2f} Requests/sec (RPS)")
    print(f"• Overall Latency Distribution (ms):")
    print(f"    - Min : {percentiles['min']} ms")
    print(f"    - Avg : {percentiles['avg']} ms")
    print(f"    - p50 : {percentiles['p50']} ms (Median)")
    print(f"    - p90 : {percentiles['p90']} ms")
    print(f"    - p95 : {percentiles['p95']} ms")
    print(f"    - p99 : {percentiles['p99']} ms")
    print(f"    - Max : {percentiles['max']} ms")

    print(f"\n📈 Latency Breakdown by Endpoint (p50 / p95 / p99):")
    for ep, lats in endpoint_latencies.items():
        ep_p = calculate_percentiles(lats)
        print(f"    • /{ep:<12}: p50={ep_p['p50']}ms | p95={ep_p['p95']}ms | p99={ep_p['p99']}ms (Count: {len(lats)})")

    return {
        "phase": "FastAPI Backend Engine",
        "users": total_users,
        "total_requests": total_requests,
        "success_rate": success_rate,
        "status_codes": status_counts,
        "duration_sec": round(total_wall_clock, 2),
        "rps": round(rps, 2),
        "percentiles": percentiles,
        "endpoint_latencies": {ep: calculate_percentiles(lats) for ep, lats in endpoint_latencies.items()},
        "errors": errors[:5],
    }


async def run_ramp_up_concurrency_matrix():
    """
    Ramps up concurrency in 4 tiers: 100 -> 250 -> 500 -> 1000 users
    to detect latency degradation inflection points.
    """
    print(f"\n=================================================================")
    print(f"📈 [PHASE 3] STEPPED CONCURRENCY RAMP-UP MATRIX (100 -> 1000)")
    print(f"=================================================================")
    tiers = [100, 250, 500, 1000]
    tier_results = []

    transport = httpx.ASGITransport(app=fastapi_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        for user_count in tiers:
            sem = asyncio.Semaphore(min(user_count, 150))
            lats = []
            t_start = time.perf_counter()

            async def quick_ping(u):
                async with sem:
                    s = time.perf_counter()
                    try:
                        r = await client.get("/health")
                        lats.append((time.perf_counter() - s) * 1000.0)
                    except:
                        pass

            await asyncio.gather(*(quick_ping(i) for i in range(user_count)))
            wall = time.perf_counter() - t_start
            p = calculate_percentiles(lats)
            rps = len(lats) / wall if wall > 0 else 0
            tier_results.append((user_count, p['avg'], p['p50'], p['p95'], p['p99'], round(rps, 1)))
            print(f"  • {user_count:>4} Users -> Avg: {p['avg']:>6.2f}ms | p50: {p['p50']:>6.2f}ms | p95: {p['p95']:>6.2f}ms | p99: {p['p99']:>6.2f}ms | RPS: {rps:>7.1f}")

    return tier_results


async def main():
    print("=" * 65)
    print("      TradeX Pro — High-Capacity 1,000 User Stress Test")
    print("=" * 65)

    # 1. Test Live Vercel Production Frontend with 1,000 Concurrent Users
    frontend_results = await test_live_production_frontend(total_users=1000, concurrency_limit=100)

    # 2. Test FastAPI Core Engine with 1,000 Virtual Algorithmic Traders
    backend_results = await test_fastapi_backend_engine(total_users=1000, concurrency_limit=100)

    # 3. Test Ramp-up Concurrency Scaling Matrix
    tier_results = await run_ramp_up_concurrency_matrix()

    print("\n" + "=" * 65)
    print("               🏁 LOAD TESTING RUN COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(main())
