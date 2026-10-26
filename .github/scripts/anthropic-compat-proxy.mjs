// Local shim between Claude Code and an Anthropic-compatible gateway.
//
// Claude Code puts the skill listing, the environment block and other harness
// context into messages with role "system" inside the `messages` array. The
// Anthropic API accepts that, but some compatible gateways (Ollama's
// /v1/messages endpoint, seen with beam:cloud) silently drop such messages. The
// model then never sees the skill list or its working directory and cannot
// choose a skill, which makes every skill-fired grader fail for reasons that
// have nothing to do with the plugin.
//
// This proxy moves those messages into the top-level `system` field, which every
// gateway honors, and forwards everything else unchanged (streaming included).
//
// Env (when run as a script): UPSTREAM_URL and PROXY_PORT_FILE (the chosen port is
// written there once listening). It binds to 127.0.0.1 on a random port.
import http from 'node:http';
import https from 'node:https';
import { writeFileSync } from 'node:fs';

export const textOf = (content) =>
  typeof content === 'string'
    ? content
    : (content || []).filter((b) => b && b.type === 'text').map((b) => b.text ?? '').join('\n');

export function foldSystemMessages(body) {
  if (!body || !Array.isArray(body.messages)) return { body, moved: 0 };
  // Only fold system messages that carry text; anything else stays in messages.
  const isFoldable = (m) => m && m.role === 'system' && textOf(m.content) !== '';
  const moved = body.messages.filter(isFoldable);
  if (!moved.length) return { body, moved: 0 };
  const extra = moved.map((m) => textOf(m.content));
  const system =
    typeof body.system === 'string'
      ? [{ type: 'text', text: body.system }]
      : Array.isArray(body.system) ? body.system.slice() : [];
  for (const text of extra) system.push({ type: 'text', text });
  return {
    body: { ...body, system, messages: body.messages.filter((m) => !isFoldable(m)) },
    moved: moved.length,
  };
}

function createServer(upstream) {
  const client = upstream.protocol === 'http:' ? http : https;
  const basePath = upstream.pathname.replace(/\/$/, '');
  return http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    let payload = Buffer.concat(chunks);
    const isMessages = req.method === 'POST' && /\/v1\/messages(\?|$)/.test(req.url);
    if (isMessages) {
      try {
        const { body, moved } = foldSystemMessages(JSON.parse(payload.toString('utf8')));
        if (moved) {
          payload = Buffer.from(JSON.stringify(body));
          console.error(`[compat-proxy] folded ${moved} system message(s) into system`);
        }
      } catch {
        // Not JSON: forward untouched.
      }
    }
    const headers = { ...req.headers, host: upstream.host, 'accept-encoding': 'identity' };
    delete headers['content-length'];
    if (payload.length) headers['content-length'] = String(payload.length);
    const up = client.request(
      {
        protocol: upstream.protocol,
        hostname: upstream.hostname,
        port: upstream.port || undefined,
        method: req.method,
        path: basePath + req.url,
        headers,
      },
      (ur) => {
        res.writeHead(ur.statusCode || 502, ur.headers);
        ur.pipe(res);
      },
    );
    up.on('error', (e) => {
      console.error(`[compat-proxy] upstream error: ${e.message}`);
      if (!res.headersSent) res.writeHead(502);
      res.end();
    });
    up.end(payload);
  });
});
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const portFile = process.env.PROXY_PORT_FILE;
  let upstream;
  try {
    upstream = new URL(process.env.UPSTREAM_URL || '');
  } catch {
    // handled below
  }
  if (!upstream || !portFile) {
    console.error('UPSTREAM_URL (a valid URL) and PROXY_PORT_FILE are required');
    process.exit(2);
  }
  const server = createServer(upstream);
  server.listen(0, '127.0.0.1', () => {
    writeFileSync(portFile, String(server.address().port));
  });
}
