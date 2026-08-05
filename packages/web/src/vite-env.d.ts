/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PartyKit host for online multiplayer — "localhost:1999" in dev (partykit's default
   *  port), "<project>.<user>.partykit.dev" once deployed. See packages/server. */
  readonly VITE_PARTYKIT_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
