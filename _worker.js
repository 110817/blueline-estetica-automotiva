const ORIGIN = "https://blueline-estetica-automotiva.patimedrado.chatgpt.site";

const MOBILE_PATCH = `
<style id="blueline-mobile-fixes">
@media (max-width: 768px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: clip !important;
  }

  body,
  main,
  header,
  footer,
  section {
    max-width: 100% !important;
  }

  img,
  video,
  iframe,
  svg,
  canvas {
    max-width: 100% !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Sobe o BLOCO de conteúdo do hero sem mover o logo. */
  [data-blueline-mobile-hero-copy="true"] {
    position: relative !important;
    top: -58px !important;
    margin-bottom: -58px !important;
  }
}
</style>

<script id="blueline-mobile-fix-script">
(function () {
  function normalizeText(value) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/\\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findExactText(target) {
    var nodes = document.querySelectorAll("span, p, small, strong, em, div");
    for (var i = 0; i < nodes.length; i++) {
      if (normalizeText(nodes[i].textContent) === target) {
        return nodes[i];
      }
    }
    return null;
  }

  function applyMobileFixes() {
    if (window.innerWidth > 768) return;

    document.documentElement.style.maxWidth = "100%";
    document.documentElement.style.overflowX = "clip";
    document.body.style.maxWidth = "100%";
    document.body.style.overflowX = "clip";

    var eyebrow = findExactText("estetica automotiva especializada");
    var title = document.querySelector("h1");

    if (!eyebrow || !title) return;

    /*
      Encontra o primeiro ancestral da tag que contém o H1.
      Esse é o bloco de copy do hero; mover esse ancestral mantém
      tag + título + descrição + botões unidos, sem deslocar o logo.
    */
    var wrapper = eyebrow.parentElement;
    var safety = 0;

    while (wrapper && !wrapper.contains(title) && safety < 8) {
      wrapper = wrapper.parentElement;
      safety++;
    }

    if (wrapper && wrapper !== document.body && wrapper !== document.documentElement) {
      wrapper.setAttribute("data-blueline-mobile-hero-copy", "true");
    }
  }

  function runFix() {
    applyMobileFixes();

    /* O Work pode hidratar o DOM depois do DOMContentLoaded. */
    setTimeout(applyMobileFixes, 250);
    setTimeout(applyMobileFixes, 800);
    setTimeout(applyMobileFixes, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runFix, { once: true });
  } else {
    runFix();
  }

  window.addEventListener("resize", applyMobileFixes);
})();
</script>

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

    if (html.includes("</head>")) {
      html = html.replace("</head>", MOBILE_PATCH + "</head>");
    } else {
      html = MOBILE_PATCH + html;
    }

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
