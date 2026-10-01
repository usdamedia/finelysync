const express = require('express');
const path = require('path');
const fs = require('fs');

function normalizeIp(value) {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
}

function firstForwardedIp(value) {
    if (!value || typeof value !== 'string') return '';
    const [first] = value.split(',');
    return normalizeIp(first);
}

function getClientIp(req) {
    // Prefer standard reverse-proxy header (works for Vercel and most proxies).
    const forwardedIp = firstForwardedIp(req.headers['x-forwarded-for']);
    if (forwardedIp) return forwardedIp;

    return normalizeIp(req.ip || req.socket?.remoteAddress || '');
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    console.log(">>> Starting Server with Vite Middleware...");

    // Respect proxy headers so req.ip works properly behind Vercel/reverse proxies.
    app.set('trust proxy', true);

    // Attach client/network metadata for request logging.
    app.use((req, _res, next) => {
        req.clientIp = getClientIp(req);
        req.edgeIp = normalizeIp(req.socket?.remoteAddress || '');
        next();
    });

    const { createServer: createViteServer } = require('vite');
    const vite = await createViteServer({
        server: {
            middlewareMode: true,
            hmr: false // Platform disables HMR anyway
        },
        appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
        const url = req.originalUrl;
        console.log(
            `>>> Request: ${url} | client_ip=${req.clientIp || '-'} | edge_ip=${req.edgeIp || '-'}`
        );
        if (url.includes('.')) {
            return next();
        }
        try {
            let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
            console.error(">>> VITE ERROR:", e);
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`>>> Server running at http://localhost:${PORT}`);
    });
}

startServer();
