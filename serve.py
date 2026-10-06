# Lokaler Testserver ohne Browser-Cache: python serve.py  →  http://localhost:5173
import http.server

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(('', 5173), NoCache) as httpd:
    print('Syrian Star läuft auf http://localhost:5173')
    httpd.serve_forever()
