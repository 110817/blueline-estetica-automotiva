const ORIGIN = "https://blueline-estetica-automotiva.patimedrado.chatgpt.site";

function cleanHeaders(headers) {
  const out = new Headers(headers);
  out.delete("content-security-policy");
  out.delete("content-security-policy-report-only");
  out.delete("x-frame-options");
  return out;
}

async function proxyRequest(request) {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, ORIGIN);

  const reqHeaders = new Headers(request.headers);
  reqHeaders.delete("host");
  reqHeaders.delete("cf-connecting-ip");
  reqHeaders.delete("cf-ipcountry");
  reqHeaders.delete("cf-ray");
  reqHeaders.delete("cf-visitor");

  const init = {
    method: request.method,
    headers: reqHeaders,
    redirect: "manual"
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
  }

  const upstream = await fetch(targetUrl.toString(), init);
  const responseHeaders = cleanHeaders(upstream.headers);

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

  const contentType = responseHeaders.get("content-type") || "";
  responseHeaders.set("x-blueline-source", "work-proxy");

  if (request.method !== "HEAD" && contentType.includes("text/html")) {
    let html = await upstream.text();
    html = html.split(ORIGIN).join(incomingUrl.origin);
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");
    return new Response(html, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await proxyRequest(request);
    } catch (error) {
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("Blueline temporariamente indisponível.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
