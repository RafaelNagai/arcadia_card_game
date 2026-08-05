/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** partyserver/Durable Object host for online multiplayer — "localhost:1999" in dev
   *  (matches packages/server's `wrangler dev --port 1999`), typically
   *  "<project>.<subdomain>.workers.dev" once deployed. See packages/server. */
  readonly VITE_PARTYKIT_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
