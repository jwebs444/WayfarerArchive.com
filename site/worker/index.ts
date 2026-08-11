/** Cloudflare Worker entry point for Wayfarer's Archive. */
import site from "vinext/server/app-router-entry";

type SiteAssets = NonNullable<Parameters<typeof site.fetch>[1]>["ASSETS"];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return site.fetch(request, env as Env & { ASSETS?: SiteAssets }, ctx);
  },
} satisfies ExportedHandler<Env>;
