# Memorystore: Valkey, Redis, caching, and migration

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Goal and current product status

Implement cache-aside behavior, reason about eviction and failure, and select a supported Memorystore option. Allow 75–90 minutes. Current service documentation lists Memorystore for Valkey, Redis Cluster, Redis, and deprecated Memcached. As checked on 2026-10-18, the Memcached notice says new-project creation restrictions begin after February 1, 2027, and service/customer-care availability ends January 31, 2029. Use the live notice for migration planning, since dates and eligibility can change. New designs should evaluate supported alternatives rather than begin on a deprecated path. [Memorystore services](https://docs.cloud.google.com/memorystore/docs) · [Memcached deprecation](https://docs.cloud.google.com/memorystore/docs/memcached/deprecation/memcached)

Valkey and Redis expose rich in-memory structures such as strings, hashes, lists, sets, and sorted sets, subject to managed-service supported commands and configuration. Clustered offerings distribute keys and require cluster-aware clients; multi-key operations may need compatible hash-slot placement. Memorystore for Redis and Redis Cluster are different managed products, not just two names for a size setting. Memcached has a simpler cache protocol and different client behaviors, so migration to Valkey is an application compatibility exercise rather than only changing an endpoint.

## Cache correctness before cache speed

With cache-aside, the application reads the cache first, loads a miss from the durable source, then populates the cache with a TTL. A write typically changes the source and invalidates or updates relevant cache entries. Race conditions can reinsert old values after invalidation; versioned keys, bounded TTLs, or stronger coordination may be needed. Decide how much staleness the business can tolerate.

Eviction removes entries when memory is constrained according to policy. TTL expiration removes them after a time interval. Neither is a reliable business event scheduler. A cache hit is not evidence that the source still authorizes the user; keys and application checks must preserve tenant isolation. Avoid using a cache as the only copy of money balances or orders unless the chosen product's persistence, durability, and recovery contract explicitly meet the application's needs.

Stampedes happen when many callers load the same expired key simultaneously. Use request coalescing, jittered TTLs, bounded locks, or stale-while-revalidate according to requirements. Negative caching can reduce repeated misses, but its TTL must be short enough not to hide newly created data. Rate limits need atomic updates and a defined fail-open/fail-closed policy.

## Prerequisites and local lab

Complete [lab setup](../../LAB-SETUP.md). The default Cloud Shell Bash lab uses a local Docker container and incurs no Memorystore service charge. Docker and network access to its public image registry are needed. This local Valkey image teaches protocol semantics; it does not simulate managed failover or guarantee that every command is supported by a particular service edition.

```bash
docker run --name roadmap-valkey --rm -d valkey/valkey:8
docker exec roadmap-valkey valkey-cli PING
docker exec roadmap-valkey valkey-cli SET product:42:v1 '{"price_minor":1500}' EX 60
docker exec roadmap-valkey valkey-cli GET product:42:v1
docker exec roadmap-valkey valkey-cli TTL product:42:v1
docker exec roadmap-valkey valkey-cli INCR rate:user-1
docker exec roadmap-valkey valkey-cli EXPIRE rate:user-1 60
```

Expect `PONG`, the JSON value, a positive TTL, and a count of one. The separate `INCR`/`EXPIRE` commands are intentionally a teaching example: a process crash between them can leave a key without expiration. A production rate limiter needs an atomic script/transaction pattern compatible with the chosen service.

```bash
docker exec roadmap-valkey valkey-cli EVAL \
  'local n=redis.call("INCR",KEYS[1]); if n==1 then redis.call("EXPIRE",KEYS[1],ARGV[1]); end; return n' \
  1 rate:user-2 60
docker exec roadmap-valkey valkey-cli TTL rate:user-2
docker exec roadmap-valkey valkey-cli DEL product:42:v1
docker exec roadmap-valkey valkey-cli GET product:42:v1
```

1. Verify deletion produces a cache miss. Describe how your application would retrieve the authoritative product record and repopulate it.
2. Change a product's source price. Compare invalidation versus updating the cache and identify a possible stale-reader race.
3. Add a tenant prefix to every key and test that users from tenant A never request tenant B's keys. Key naming helps organization but is not a replacement for server authorization.
4. Design a cache outage test: bypass reads, protect the database with concurrency limits, and gradually warm popular entries. Record the maximum backend load you can tolerate.

## Optional managed setup

A real deployment requires billing, the selected product's API (for example `memorystore.googleapis.com` or the Redis service API as documented), instance creation permissions, and private network connectivity. Open Memorystore, select the product, choose `REGION`, size/shards/replicas and security settings, review the cost estimate, and cancel for the design-only path. Do not assume Cloud Shell can directly reach a private cache endpoint.

For a funded trial, connect from an authorized client in the documented network, use the product's supported TLS/authentication configuration, and run the small key experiment. Measure hit ratio, memory, evictions, command latency, errors, and client reconnection during a planned failure test. Compare cache savings with provisioned memory and replica costs. [Redis documentation](https://docs.cloud.google.com/memorystore/docs/redis) · [Valkey documentation](https://docs.cloud.google.com/memorystore/docs/valkey)

## Troubleshooting, cleanup, and exercise

Timeouts often indicate private routing, firewall, DNS, or connection-pool problems. `MOVED` responses can indicate a client that is not cluster-aware. Unexpected misses may be expiration, eviction, wrong database/key prefix, or failed population. A high hit ratio can still hide poor tail latency from a few expensive hot keys. Do not log secrets or full session tokens as keys.

Stop the local container with `docker stop roadmap-valkey`. Delete optional managed lab instances and dedicated client resources; verify memory resources are gone instead of merely disconnecting clients. Exercise: checkout inventory must be current but product descriptions may be five minutes stale. A worked solution keeps stock reservation in the transactional source and uses a TTL cache for descriptions, with explicit invalidation on edits. The cache speeds suitable reads without redefining the transaction's source of truth.
