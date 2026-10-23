# Repository modularity and testing audit — 2026-10-23

## Baseline

The repository has seven acyclic workspace units: `apps/web` (Next.js UI), `servers/api` (Express API), `packages/ui` (shadcn primitives and generic presentation), `packages/types` (cross-workspace contracts), `packages/logging`, and the TypeScript/ESLint configuration packages. `codebase/` is the repository-owned control plane; it was inspected but not modified. The tracked source tree contains 278 files outside generated/cache directories.

The dependency graph is directionally sound: web depends only on UI/config, API depends on logging/types/config, and shared packages do not depend on applications or servers. No cycle was reported by the repository graph.

## Ownership review

- Story Agent API owns provider integration, routing, pipeline, validation, prompts, repository, queue, HTTP mapping, evaluation, and deterministic tests under one feature boundary. Its service is large but cohesive: it is the bounded pipeline coordinator, so splitting it further without a new independent boundary would add indirection.
- The queue and repository are independent persistence/application boundaries with focused tests.
- The Story Agent web widget owns API calls, polling, active-run state, and clipboard orchestration. Its component composition has already been split into feature-owned workshop, composer, draft dossier, criteria, archive, and status-state modules. None are reusable outside the feature, so they remain out of `packages/ui`.
- `packages/ui` owns shadcn primitives, generic compositions, and the generic Gecko presentation. No feature logic imports upward into the package.
- Large generated shadcn primitive files and control-plane modules are intentionally cohesive vendor/repository-tool boundaries; they are not candidates for arbitrary file splitting.

## Confirmed defects fixed

1. `story-agent.queue.ts` used an interval without an in-flight guard. A slow provider request could start another claim/process cycle before the first completed, contrary to the one-run-at-a-time queue requirement. The queue now holds a closure-local processing guard. A deterministic pending-promise test proves only one claim and service run occur.
2. The web Story Agent client cast unknown persisted story payloads directly to `StoryAgentStory[]`. A damaged historic draft could later crash presentation code that requires arrays such as `states`. The client now validates all required story fields and turns an invalid `draft` record into a controlled `failed` UI state. A regression test covers the malformed persisted payload.

## Testing review

- API tests cover provider integration/failover, pipeline validation/repair/budgets, Mongo repository behavior, queue processing, route/controller mapping, configuration, and HTTP lifecycle behavior.
- Web tests cover environment/configuration plus Story Agent filtering, copy formatting, and malformed payload fallback. The Story Agent helper test is included in the normal web test script rather than requiring a separate manual invocation. There is no browser E2E runner in the repository; no E2E claim is made.
- UI package tests cover public package consumption and Gecko presentation semantics. Current server-side static markup tests cannot prove client keyboard traversal or viewport layout; those remain manual browser verification work.

## Intentional non-changes

- No new package, dependency, framework, provider, persistence schema, API contract, or control-plane policy was introduced.
- No mass move was performed. Existing categorization and public surfaces already satisfy the repository architecture checks.
- The server DNS resolver override was noted during audit but not changed: its reason is not documented, so removing it would be speculative behavior change.

## Validation plan

Run repository discovery/graph, structural check, lint, strict type check, complete tests, build, scan, and validate in the configured order. The production web build requires the documented non-secret `NEXT_PUBLIC_API_BASE_URL` value.
