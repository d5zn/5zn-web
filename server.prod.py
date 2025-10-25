#!/usr/bin/env python3
"""
Production server for 5zn-web
Optimized for production deployment
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
PORT = int(os.environ.get('PORT', 8000))
HOST = os.environ.get('HOST', '0.0.0.0')

class ProductionHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Production HTTP request handler with optimizations"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        
        # Add caching headers for static assets
        if self.path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=31536000')  # 1 year
        else:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        
        super().end_headers()
    
    def do_GET(self):
        # Serve production files with fallback
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.prod.html'
        
        # Use original files for now (same as development)
        # if self.path == '/styles.css':
        #     self.path = '/styles.min.css'
        
        # if self.path == '/app.js':
        #     self.path = '/app.min.js'
        
        return super().do_GET()

def main():
    """Start production server"""
    print(f"🚀 Starting 5zn-web production server...")
    print(f"📡 Server running at http://{HOST}:{PORT}/")
    print(f"📁 Serving files from: {os.getcwd()}")
    print(f"🔒 Security headers enabled")
    print(f"⚡ Optimized for production")
    
    try:
        with socketserver.TCPServer((HOST, PORT), ProductionHTTPRequestHandler) as httpd:
            print(f"✅ Server started successfully!")
            print(f"🌐 Open http://localhost:{PORT}/ in your browser")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print(f"💡 Try a different port: PORT={PORT+1} python3 server.prod.py")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
