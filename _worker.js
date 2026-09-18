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

  [data-blueline-hero-copy-fix="true"] {
    position: relative !important;
    top: -54px !important;
    margin-bottom: -54px !important;
    z-index: 5 !important;
  }
}
</style>

<script id="blueline-mobile-fix-script">
(function () {
  var PHRASE = "estetica automotiva especializada";

  function normalize(value) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/\\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findEyebrow() {
    var all = Array.from(document.querySelectorAll("body *"));
    var matches = all.filter(function (el) {
      var text = normalize(el.innerText || el.textContent);
      return text.indexOf(PHRASE) !== -1;
    });

    if (!matches.length) return null;

    matches.sort(function (a, b) {
      var ta = normalize(a.innerText || a.textContent).length;
      var tb = normalize(b.innerText || b.textContent).length;
      if (ta !== tb) return ta - tb;

      var ra = a.getBoundingClientRect();
      var rb = b.getBoundingClientRect();
      return (ra.width * ra.height) - (rb.width * rb.height);
    });

    return matches[0];
  }

  function findHeroTitle() {
    var headings = Array.from(document.querySelectorAll("h1, h2"));
    for (var i = 0; i < headings.length; i++) {
      var text = normalize(headings[i].innerText || headings[i].textContent);
      if (
        text.indexOf("protecao que voce ve") !== -1 ||
        text.indexOf("cuidado que permanece") !== -1
      ) {
        return headings[i];
      }
    }
    return document.querySelector("h1");
  }

  function commonAncestor(a, b) {
    if (!a || !b) return null;
    var node = a;
    while (node && node !== document.body) {
      if (node.contains(b)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function applyFix() {
    if (window.innerWidth > 768) return;

    document.documentElement.style.setProperty("overflow-x", "clip", "important");
    document.body.style.setProperty("overflow-x", "clip", "important");
    document.documentElement.style.setProperty("max-width", "100%", "important");
    document.body.style.setProperty("max-width", "100%", "important");

    var eyebrow = findEyebrow();
    var title = findHeroTitle();
    if (!eyebrow || !title) return;

    var wrapper = commonAncestor(eyebrow, title);

    /*
      Evita pegar uma seção grande demais. Se o ancestral comum for o próprio
      section/main, tenta usar o filho direto desse ancestral que contém ambos.
    */
    if (wrapper) {
      var candidates = Array.from(wrapper.children || []);
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].contains(eyebrow) && candidates[i].contains(title)) {
          wrapper = candidates[i];
          break;
        }
      }
    }

    if (wrapper && wrapper !== document.body && wrapper !== document.documentElement) {
      wrapper.setAttribute("data-blueline-hero-copy-fix", "true");
    }
  }

  function boot() {
    applyFix();

    var observer = new MutationObserver(function () {
      applyFix();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    setTimeout(applyFix, 150);
    setTimeout(applyFix, 500);
    setTimeout(applyFix, 1200);
    setTimeout(applyFix, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("resize", applyFix);
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
