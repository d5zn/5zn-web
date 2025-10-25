#!/bin/bash

# Trinky Web - Development Server with ngrok
# This script starts the local server and creates a public tunnel for OAuth

echo "🚀 Starting Trinky Web Development Server..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Please install ngrok first:"
    echo "   Visit: https://ngrok.com/download"
    echo "   Or run: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3"
    exit 1
fi

# Start the local server in background
echo "📡 Starting local server on port 8000..."
python3 server.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start ngrok tunnel
echo "🌐 Creating public tunnel with ngrok..."
ngrok http 8000 --log=stdout &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL
echo "🔍 Getting public URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['proto'] == 'https':
            print(tunnel['public_url'])
            break
except:
    print('Error getting ngrok URL')
")

if [ -n "$NGROK_URL" ]; then
    echo "✅ Public URL: $NGROK_URL"
    echo ""
    echo "📋 Strava API Configuration:"
    echo "   Authorization Callback Domain: $(echo $NGROK_URL | sed 's|https://||')"
    echo "   Website: $NGROK_URL"
    echo ""
    echo "🔧 Update your Strava API settings at:"
    echo "   https://www.strava.com/settings/api"
    echo ""
    echo "🌐 Opening browser..."
    python3 -c "import webbrowser; webbrowser.open('$NGROK_URL')"
else
    echo "❌ Failed to get ngrok URL"
    echo "   Please check ngrok status at: http://localhost:4040"
fi

echo ""
echo "🛑 Press Ctrl+C to stop both servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
