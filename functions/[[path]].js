const ORIGIN = "https://blueline-estetica-automotiva.patimedrado.chatgpt.site";

export async function onRequest(context) {
  const request = context.request;
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

  try {
    const upstream = await fetch(targetUrl.toString(), init);
    const responseHeaders = new Headers(upstream.headers);

    responseHeaders.delete("content-security-policy");
    responseHeaders.delete("content-security-policy-report-only");
    responseHeaders.delete("x-frame-options");

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
    const contentType = responseHeaders.get("content-type") || "";

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
  } catch (error) {
    return context.next();
  }
}
