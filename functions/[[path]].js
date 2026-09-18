const ORIGIN = "https://blueline-estetica-automotiva.patimedrado.chatgpt.site";

export async function onRequest(context) {
  const incoming = context.request;
  const url = new URL(incoming.url);
  const target = new URL(url.pathname + url.search, ORIGIN);

  const headers = new Headers(incoming.headers);
  headers.delete("host");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");

  const init = {
    method: incoming.method,
    headers,
    redirect: "manual"
  };

  if (!["GET", "HEAD"].includes(incoming.method)) {
    init.body = incoming.body;
  }

  let response;
  try {
    response = await fetch(target.toString(), init);
  } catch (error) {
    return context.next();
  }

  const responseHeaders = new Headers(response.headers);

  const location = responseHeaders.get("location");
  if (location) {
    try {
      const redirectUrl = new URL(location, ORIGIN);
      if (redirectUrl.origin === ORIGIN) {
        redirectUrl.protocol = url.protocol;
        redirectUrl.host = url.host;
        responseHeaders.set("location", redirectUrl.toString());
      }
    } catch {}
  }

  responseHeaders.set("x-blueline-source", "work-proxy");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
