"""Static server for the Playwright suite.

Same as `python -m http.server PORT --bind 127.0.0.1 --directory dist`, but with a
listen backlog of 256 instead of socketserver's default 5, so parallel browser
workers do not get ERR_CONNECTION_REFUSED. Usage: python tests/serve.py 8408 dist
"""
import functools
import http.server
import sys
from pathlib import Path


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404 and "text/html" in self.headers.get("Accept", ""):
            body = (Path(self.directory) / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, *args):  # keep the runner output clean
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8408
    directory = sys.argv[2] if len(sys.argv) > 2 else "dist"
    handler = functools.partial(Handler, directory=directory)
    with Server(("127.0.0.1", port), handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
