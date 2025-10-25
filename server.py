#!/usr/bin/env python3
"""
Simple HTTP server for Trinky Web
Run with: python3 server.py
"""

import http.server
import socketserver
import webbrowser
import os
import json
from datetime import datetime
from urllib.parse import urlparse, parse_qs

class TrinkyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # CSP for development - allow everything
        self.send_header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; connect-src *;")
        
        # Prevent caching for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Last-Modified', 'Thu, 01 Jan 1970 00:00:00 GMT')
        self.send_header('ETag', '')
        
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests for OAuth token exchange"""
        if self.path == '/api/strava/token':
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                code = data.get('code')
                if not code:
                    self.send_error(400, 'Missing authorization code')
                    return
                
                # Exchange code for token with Strava API
                import urllib.request
                import urllib.parse
                
                # Get configuration from server_config.py or environment
                try:
                    from server_config import STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
                except ImportError:
                    # Fallback to environment variables or default
                    import os
                    STRAVA_CLIENT_ID = os.environ.get('STRAVA_CLIENT_ID', 'YOUR_STRAVA_CLIENT_ID')
                    STRAVA_CLIENT_SECRET = os.environ.get('STRAVA_CLIENT_SECRET', 'YOUR_STRAVA_CLIENT_SECRET')
                
                client_id = STRAVA_CLIENT_ID
                client_secret = STRAVA_CLIENT_SECRET
                
                # Prepare token exchange request
                token_data = {
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'code': code,
                    'grant_type': 'authorization_code'
                }
                
                # Make request to Strava token endpoint
                data = urllib.parse.urlencode(token_data).encode()
                req = urllib.request.Request(
                    'https://www.strava.com/oauth/token',
                    data=data,
                    method='POST'
                )
                
                try:
                    with urllib.request.urlopen(req) as response:
                        token_response = json.loads(response.read().decode())
                        
                        # Сохраняем данные пользователя
                        athlete_data = token_response.get('athlete', {})
                        if athlete_data:
                            self.save_athlete_data(athlete_data, token_response.get('access_token'))
                        
                        # Send success response
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        
                        response_data = {
                            'access_token': token_response.get('access_token'),
                            'refresh_token': token_response.get('refresh_token'),
                            'expires_at': token_response.get('expires_at'),
                            'athlete': athlete_data
                        }
                        
                        self.wfile.write(json.dumps(response_data).encode())
                        print(f"✅ Token exchange successful for athlete: {athlete_data.get('firstname', 'Unknown')}")
                        
                except urllib.error.HTTPError as e:
                    error_body = e.read().decode()
                    print(f"❌ Strava API error: {e.code} - {error_body}")
                    
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Token exchange failed'}).encode())
                    
            except Exception as e:
                print(f"❌ Error handling token exchange: {e}")
                self.send_error(500, f'Internal server error: {str(e)}')
        else:
            self.send_error(404, 'Not Found')

    def save_athlete_data(self, athlete_data, access_token):
        """Save athlete data to JSON file"""
        try:
            # Подготовка данных для сохранения
            athlete_info = {
                'athlete_id': athlete_data.get('id'),
                'username': athlete_data.get('username'),
                'firstname': athlete_data.get('firstname'),
                'lastname': athlete_data.get('lastname'),
                'email': athlete_data.get('email', 'not_provided'),  # Email может быть недоступен
                'city': athlete_data.get('city'),
                'country': athlete_data.get('country'),
                'profile_picture': athlete_data.get('profile'),
                'created_at': athlete_data.get('created_at'),
                'updated_at': athlete_data.get('updated_at'),
                'connected_at': datetime.now().isoformat(),
                'access_token_hash': self.hash_token(access_token)  # Не сохраняем токен напрямую!
            }
            
            # Создаем директорию для данных
            data_dir = 'data'
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
            
            # Сохраняем в файл (один файл на пользователя)
            filename = os.path.join(data_dir, f'athlete_{athlete_info["athlete_id"]}.json')
            
            # Если файл уже существует, обновляем данные
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    existing_data.update(athlete_info)
                    athlete_info = existing_data
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(athlete_info, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Saved athlete data: {athlete_info.get('firstname')} {athlete_info.get('lastname')} (ID: {athlete_info.get('athlete_id')})")
            
        except Exception as e:
            print(f"⚠️ Error saving athlete data: {e}")
    
    def hash_token(self, token):
        """Create a hash of the token for logging purposes (not reversible)"""
        try:
            import hashlib
            return hashlib.sha256(token.encode()).hexdigest()[:16]  # Первые 16 символов хеша
        except:
            return 'not_available'

    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"📡 {format % args}")

def main():
    PORT = 8000
    
    # Change to the directory containing the web files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), TrinkyHTTPRequestHandler) as httpd:
        print(f"🚀 Trinky Web Server running at http://localhost:{PORT}")
        print(f"📱 Open your browser and navigate to http://localhost:{PORT}")
        print("🛑 Press Ctrl+C to stop the server")
        print("")
        print("⚠️  IMPORTANT: Update CLIENT_ID and CLIENT_SECRET in server.py before using OAuth!")
        
        try:
            # Try to open browser automatically
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    main()
