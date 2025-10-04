/**
 * NUCLEAR OPTION: Pure HTML OAuth Test Page
 * No React dependencies, no complex components, just pure HTML
 */

'use client';

export default function OAuthTestPage() {
  return (
    <html>
      <head>
        <title>OAuth Test - Nuclear Option</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            color: white;
            margin: 0;
            padding: 40px;
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 2rem;
            background: linear-gradient(45deg, #fff, #888);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .button {
            display: inline-block;
            padding: 20px 40px;
            font-size: 1.2rem;
            font-weight: bold;
            background: white;
            color: black;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            margin: 10px;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          .button:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
          }
          .button:active {
            transform: translateY(0);
          }
          .debug {
            margin-top: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            text-align: left;
          }
          .status {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
          }
          .success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          .error { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
          .info { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🚀 OAuth Test - Nuclear Option</h1>
          
          <div id="status" className="status info">
            Ready to test OAuth flow
          </div>
          
          <div>
            <button 
              className="button"
              onClick={() => (window as unknown as { testBasicJS: () => void }).testBasicJS()}
            >
              🔧 Test Basic JavaScript
            </button>
            
            <button 
              className="button"
              onClick={() => (window as unknown as { testEnvironment: () => void }).testEnvironment()}
            >
              🔍 Test Environment API
            </button>
            
            <button 
              className="button"
              onClick={() => (window as unknown as { directOAuth: () => void }).directOAuth()}
            >
              🚀 Direct OAuth (Nuclear)
            </button>
          </div>
          
          <div className="debug">
            <h3>Debug Console:</h3>
            <div id="debug-output" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              Click buttons above to see debug output...
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            (window as any).log = function(message) {
              console.log(message);
              const output = document.getElementById('debug-output');
              output.innerHTML += new Date().toLocaleTimeString() + ': ' + message + '<br>';
              output.scrollTop = output.scrollHeight;
            }
            
            (window as any).setStatus = function(message, type = 'info') {
              const status = document.getElementById('status');
              status.textContent = message;
              status.className = 'status ' + type;
            }
            
            (window as any).testBasicJS = function() {
              (window as any).log('🔧 Testing basic JavaScript...');
              (window as any).setStatus('JavaScript is working!', 'success');
              alert('✅ JavaScript is working perfectly!');
            }
            
            (window as any).testEnvironment = function() {
              (window as any).log('🔍 Testing environment API...');
              (window as any).setStatus('Testing environment...', 'info');
              
              fetch('/api/debug')
                .then(response => response.json())
                .then(data => {
                  (window as any).log('✅ Environment API response: ' + JSON.stringify(data.environment));
                  (window as any).setStatus('Environment OK: ' + Object.keys(data.environment).length + ' variables', 'success');
                })
                .catch(error => {
                  (window as any).log('❌ Environment API error: ' + error.message);
                  (window as any).setStatus('Environment API failed', 'error');
                });
            }
            
            (window as any).directOAuth = function() {
              (window as any).log('🚀 Starting direct OAuth flow...');
              (window as any).setStatus('Redirecting to Strava...', 'info');
              
              const clientId = '179098';
              const redirectUri = 'https://switchbacklabsco.com/api/strava/callback-simple';
              const authUrl = 'https://www.strava.com/oauth/authorize?' + 
                'client_id=' + clientId + 
                '&response_type=code' +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&scope=read,activity:read,activity:read_all' +
                '&approval_prompt=auto' +
                '&state=race_tracker';
              
              (window as any).log('🚀 OAuth URL: ' + authUrl);
              (window as any).log('🚀 Redirecting in 2 seconds...');
              
              setTimeout(() => {
                (window as any).log('🚀 REDIRECTING NOW!');
                window.location.href = authUrl;
              }, 2000);
            }
            
            // Initialize
            (window as any).log('🚀 Nuclear OAuth test page loaded');
            (window as any).log('🔧 All functions ready');
          `
        }} />
      </body>
    </html>
  );
}
