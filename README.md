# Spettacolo Motors

Production: https://www.spettacolomotors.com.br/  
Vercel project: `spettacolo-motors-f4wa` (`henrick1`). Do not change domains to deploy inventory changes.

## Inventory

`GET /api/estoque` reads the documented AutoCerto API from the server. The browser receives only normalized public vehicle fields. OAuth credentials, tokens, plate, chassis and Renavam are never returned. The dealership is pinned to `AUTOCERTO_UNIT_CODE` and verified against the allowed units.

Configure `AUTOCERTO_USERNAME`, `AUTOCERTO_PASSWORD`, `AUTOCERTO_UNIT_CODE` as server environment secrets in Production and Preview. The private Vercel Blob store is connected through OIDC and `BLOB_STORE_ID`; no permanent Blob token is needed.

The last validated snapshot is persisted in private Blob, separately for production and preview. Conditional ETag writes protect against concurrent updates. The endpoint renews an expired snapshot on demand after **30 minutes**; the browser checks every 5 minutes while visible and Vercel caches responses for up to 5 minutes. There is no background scheduler and no promise of immediate updates when nobody visits. The interval limits writes to approximately 1,488 per 31-day month under continuous traffic, excluding previews/retries/conflicts; monitor the account's shared Blob quotas.

If AutoCerto fails, the endpoint retains the prior cars and synchronization time, marks the response `stale`, and backs off for 30 minutes. Without a valid prior snapshot it returns HTTP 503 (`unavailable`), never the old hard-coded inventory. Malformed records reject the entire import. Empty stock and removals exceeding 40% require a second successful response with matching IDs. The API has no total-count/completeness marker, so a structurally valid but semantically incomplete source response cannot always be detected. Confirm availability with the dealership.

`status: fresh` means the last source read succeeded; `syncedAt` is its timestamp. `checkedAt` is the last attempted check. A browser-only backup is supplemental; Blob is the durable source across cold starts. If Blob itself is inaccessible (including quota exhaustion), the endpoint fails explicitly and returning visitors can see their last confirmed browser snapshot with a warning.

Stable IDs use `autocerto-Codigo`. Existing links ending in the original source ID continue to resolve. Inventory edits belong in AutoCerto; the old browser-local edits remain intact and can be exported from the admin page. Integration is read-only toward AutoCerto.

## Build and checks

Use Node 24, `npm ci`, `npm test`, then `npm run build`. The build compiles JSX and copies an explicit allowlist into `dist`; backend source, tests and environment files are excluded. Vercel builds `api/estoque.js` separately as a server function.

Push a feature branch for Preview. Verify the **f4wa** deployment, `/api/estoque`, count/IDs/prices/photos against the source, filters and legacy detail links before merging to `main`. Both environments need their configured secrets and private Blob connection. The repository also has another Vercel integration; identify deployments by project name rather than assuming every Vercel status refers to production.

## Home video

The supplied Spettacolo reel retains its full 57.85-second duration, encoded as silent H.264 with faststart: desktop 1920×1080 (22,899,381 bytes) and portrait 720×1280 (10,153,677 bytes). The desktop crop comes directly from the original; no extra CSS zoom is applied. The hero selects a single source by viewport aspect ratio. Portrait tablets use the portrait version. Reduced-motion preference, data saver and 2G connections show the responsive WebP poster without requesting hero video. The separate presentation player uses the full portrait reel on demand with `preload="none"`; its previous missing `presentation-video.mp4` reference is replaced.

## Failure and rollback

The public status deliberately omits upstream error messages. To investigate: check the configured unit, secret presence, AutoCerto availability, function status, Blob connection/quota and snapshot timestamps. Do not log credentials or raw upstream responses. A failed source update should not be repaired by clearing the stored snapshot. A deployment can be rolled back in the f4wa project without DNS changes; rolling back to pre-integration code restores obsolete local data and should be used only after considering that limitation.
