import https from "node:https";

// Keep the raw incoming stream intact so JSON requests and multipart file
// uploads both reach the backend exactly as the browser sent them.
export const config = { api: { bodyParser: false } };

/** Same-origin Vercel proxy for /api/** requests. */
export default function handler(request, response) {
  const backendUrl = process.env.VITE_API_BASE_URL;

  if (!backendUrl) {
    response.status(500).json({
      success: false,
      message: "VITE_API_BASE_URL is not configured.",
    });
    return;
  }

  let backend;
  try {
    backend = new URL(backendUrl);
  } catch {
    response.status(500).json({
      success: false,
      message: "VITE_API_BASE_URL must be a valid backend URL.",
    });
    return;
  }

  const path = Array.isArray(request.query.path)
    ? request.query.path.join("/")
    : request.query.path ?? "";
  const basePath = backend.pathname.replace(/\/$/, "");
  const target = new URL(`${basePath}/api/${path}`, backend.origin);

  for (const [key, value] of Object.entries(request.query)) {
    if (key === "path") continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      target.searchParams.append(key, entry);
    }
  }

  const headers = { ...request.headers, host: target.host };
  delete headers.connection;

  const upstream = https.request(
    target,
    { method: request.method, headers },
    (upstreamResponse) => {
      response.status(upstreamResponse.statusCode ?? 502);
      for (const [key, value] of Object.entries(upstreamResponse.headers)) {
        if (value !== undefined) response.setHeader(key, value);
      }
      upstreamResponse.pipe(response);
    },
  );

  upstream.on("error", () => {
    if (!response.headersSent) {
      response.status(502).json({
        success: false,
        message: "Could not reach the backend service.",
      });
    }
  });

  request.pipe(upstream);
}
