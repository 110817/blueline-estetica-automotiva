const ORIGIN = "https://blueline-estetica-automotiva.patimedrado.chatgpt.site";

export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, ORIGIN);

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");

    const init = {
      method: request.method,
      headers,
      redirect: "manual"
    };

    if (!["GET", "HEAD"].includes(request.method)) {
      init.body = request.body;
    }

    try {
      const upstream = await fetch(targetUrl.toString(), init);
      const responseHeaders = new Headers(upstream.headers);

      const location = responseHeaders.get("location");
      if (location) {
        try {
          const redirectUrl = new URL(location, ORIGIN);
          if (redirectUrl.origin === ORIGIN) {
            redirectUrl.protocol = incomingUrl.protocol;
            redirectUrl.host = incomingUrl.host;
            responseHeaders.set("location", redirectUrl.toString());
          }
        } catch {}
      }

      responseHeaders.set("x-blueline-source", "work-proxy");

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("Blueline temporariamente indisponível.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
