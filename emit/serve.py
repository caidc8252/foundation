#!/usr/bin/env python3
"""Tiny static server for the docs page that sends no-cache headers.

The plain `python -m http.server` lets the browser (and the Codespaces
port-forward proxy) cache index.html, so regenerated docs can appear stale.
This handler stamps every response with no-store so a normal reload always
fetches the latest build. Serves ./docs on port 4000 (override: argv[1]).
"""
import functools
import http.server
import socketserver
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4000
ROOT = str(Path(__file__).resolve().parent.parent / "docs")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


Handler = functools.partial(NoCacheHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving {ROOT} on http://localhost:{PORT} (no-cache)")
    httpd.serve_forever()
