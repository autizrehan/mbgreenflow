"""
MB-Flow Local Server
A simple Python HTTP server with live reload support.
Run: python server.py
Then open http://localhost:3000 in your browser.
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class MBFlowHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that serves files from the project directory."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS and cache control headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        """Custom colored log output."""
        status = args[1] if len(args) > 1 else ''
        color = '\033[92m' if str(status).startswith('2') else '\033[93m' if str(status).startswith('3') else '\033[91m'
        reset = '\033[0m'
        print(f"  {color}[{status}]{reset} {args[0]}")


def main():
    os.chdir(DIRECTORY)

    print()
    print("  \033[1m\033[94m╔══════════════════════════════════════╗\033[0m")
    print("  \033[1m\033[94m║\033[0m   \033[1mMB-Flow Traffic Engine Server\033[0m      \033[1m\033[94m║\033[0m")
    print("  \033[1m\033[94m╚══════════════════════════════════════╝\033[0m")
    print()
    print(f"  \033[1m→\033[0m Local:   \033[4m\033[96mhttp://localhost:{PORT}\033[0m")
    print(f"  \033[1m→\033[0m Serving: \033[90m{DIRECTORY}\033[0m")
    print()
    print("  \033[90mPress Ctrl+C to stop the server.\033[0m")
    print()

    try:
        with socketserver.TCPServer(("", PORT), MBFlowHandler) as httpd:
            httpd.allow_reuse_address = True
            # Auto-open browser
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  \033[93m⚡ Server stopped.\033[0m\n")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e) or "10048" in str(e):
            print(f"\n  \033[91m✗ Port {PORT} is already in use.\033[0m")
            print(f"  \033[90mTry: python server.py  (or change PORT in script)\033[0m\n")
        else:
            raise


if __name__ == "__main__":
    main()
