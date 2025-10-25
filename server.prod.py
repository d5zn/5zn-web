#!/usr/bin/env python3
"""
Production server for 5zn-web
Optimized for production deployment
"""

import http.server
import socketserver
import os
import sys
import json
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
        
        # Serve config with environment variables
        if self.path == '/config.prod.js':
            self.serve_config()
            return
        
        # Handle Strava token exchange
        if self.path == '/api/strava/token':
            self.handle_strava_token()
            return
        
        # Use original files for now (same as development)
        # if self.path == '/styles.css':
        #     self.path = '/styles.min.css'
        
        # if self.path == '/app.js':
        #     self.path = '/app.min.js'
        
        return super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/strava/token':
            self.handle_strava_token()
        else:
            self.send_error(404, "Not Found")
    
    def serve_config(self):
        """Serve configuration with environment variables"""
        config = {
            'STRAVA': {
                'CLIENT_ID': os.environ.get('STRAVA_CLIENT_ID', 'your_strava_client_id_here'),
                'CLIENT_SECRET': os.environ.get('STRAVA_CLIENT_SECRET', 'your_strava_client_secret_here'),
                'REDIRECT_URI': os.environ.get('STRAVA_REDIRECT_URI', 'https://app.5zn.io/oauth/index.html'),
                'SCOPE': 'read,activity:read_all'
            }
        }
        
        js_config = f"window.CONFIG = {json.dumps(config)};"
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/javascript')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(js_config.encode('utf-8'))
    
    def handle_strava_token(self):
        """Handle Strava token exchange"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            code = data.get('code')
            
            if not code:
                self.send_error(400, "Missing authorization code")
                return
            
            # Exchange code for token with Strava API
            client_id = os.environ.get('STRAVA_CLIENT_ID')
            client_secret = os.environ.get('STRAVA_CLIENT_SECRET')
            
            if not client_id or not client_secret:
                self.send_error(500, "Strava credentials not configured")
                return
            
            import urllib.request
            import urllib.parse
            
            token_data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'grant_type': 'authorization_code'
            }
            
            token_url = 'https://www.strava.com/oauth/token'
            token_request = urllib.request.Request(
                token_url,
                data=urllib.parse.urlencode(token_data).encode('utf-8'),
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            with urllib.request.urlopen(token_request) as response:
                token_response = json.loads(response.read().decode('utf-8'))
                
                # Send token response to client
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(token_response).encode('utf-8'))
                
        except Exception as e:
            print(f"Token exchange error: {e}")
            self.send_error(500, f"Token exchange failed: {str(e)}")

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
