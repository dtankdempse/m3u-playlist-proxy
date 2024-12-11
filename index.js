const http = require('http');
const https = require('https');
const url = require('url');
const zlib = require('zlib');
const UserAgents = require('user-agents');
let Redis;

if (process.env.REDIS_URL) {
  Redis = require("ioredis");
}

let sessionTokens = {};
let lastCheckedTimestamps = {};
const storage = initializeStorage();

http.createServer(async (req, res) => {
  try {

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
	
	console.log(`Incoming request: ${req.url}`);
	console.log('Query parameters:', query);
	
    if (pathname === '/' && !parsedUrl.search) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="robots" content="noindex, nofollow">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M3U Playlist Proxy</title>
    <style>
    body{
        color: #626262;
    }
    /* General Form Styling */
    form {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f7f7;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Styling for Input Fields */
    input[type="text"] {
        width: calc(50% - 10px);
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 10px;
        color: #626262;
    }

    input[type="text"]:focus {
        border-color: #007bff;
        outline: none;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    /* Styling for Add More and Submit Buttons */
    button {
        padding: 10px 15px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        width: 45%;
        margin-left: 20px;
        align-content: center;
    }

    button#add-more,fetchPlaylistGroups {
        background-color: #007bff;
        color: white;
    }
	
	button#fetchPlaylistGroups {
        background-color: #007bff;
        color: white;
    }

    button[type="submit"] {
		background-color: #28a745;
		color: white;
		width: 94%;
		font-size: 18px;
		margin-top: 20px;
    }

    button:hover {
        opacity: 0.9;
    }

    button:focus {
        outline: none;
    }
    
    select {        
      width: 100%;
      font-size: 16px;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 20px;
      background-color: #fff;
      color: #626262;            
    }

    /* Styling for Text Area */
    textarea {
        width: 50%;
        max-width: 600px;
        margin: 0 auto;
        display: block;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-top: 10px;
        resize: none;
        color: #626262;
    }

    /* Styling for Header Pair Div */
    .header-pair {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    h3, h4 {        
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #626262;
    }
    
    
    .container {
        max-width: 600px;
        margin: 0 auto;
    }
        
    .epg_container {
        float: right;
        margin-right: 10px;
        position: relative;
        top: -10px;        
    }

    .footer {
        max-width: 600px;
        margin: 0 auto;
        padding-top: 20px;
        padding-bottom: 10px;
        text-align: center;
    }

    /* Group Checkbox Styling */
    .group-checkbox-container {
        max-width: 600px;
        margin: 20px auto;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        height: 200px;
        overflow-y: auto;
        background-color: #f7f7f7;
    }

    .group-checkbox-container label {
        display: block;
        margin-bottom: 5px;
    }

    /* Basic Responsive Design */
    @media (max-width: 600px) {
        input[type="text"] {
            width: 100%;
            margin-bottom: 10px;
        }

        .header-pair {
            flex-direction: column;
        }
    }
    
    pre {
      background-color: #eaeaea;
      color: #000;
      padding-top: 15px;
      padding-left: 15px;
    }

    /* Styling for Help Overlay */
    #help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    #help-content {
        position: relative;
        background-color: #fff;
        color: #333;
        padding: 20px;
        border-radius: 8px;
        max-width: 80%;
        width: 60%;
        max-height: 70%;
        overflow: scroll;
    }

    #close-help {
      position: absolute;
      top: 5px;
      right: 20px;
      background: none;
      border: none;
      font-size: 34px;
      font-weight: bold;
      color: #ff4e4e;
      cursor: pointer;
    }

    #close-help:hover {
        opacity: 0.7;
    }
    </style>
</head>
<body>
    <center><h3>M3U Playlist Proxy</h3></center>
    <div class="container">
        <p>Use the form below to generate a playlist with the necessary headers. For example, if the server requires a "Referer: http://example.com" header to allow streaming, you would enter "Referer" as the Header Name and "http://example.com" as the Header Value. <a href="#" id="help-button">More Info.</a></p>
    </div>

    <form id="headerForm">
    <div>
        <label for="playlistUrl">Playlist URL (use comma for multiple URLs):</label>
        <div class="epg_container">
            <input type="checkbox" id="epgMerging" checked><label style="font-size:13px;margin-left:2px;">Merge epg's</label>
        </div>
        <input type="text" id="playlistUrl" name="playlistUrl" placeholder="Enter playlist URL" style="width: 96%; margin-bottom: 20px;">
    </div>
    
   
	 <label id="label-checkbox-container" style="display:none;margin-bottom:-15px;">Select Groups:</label>
    
    <div class="group-checkbox-container" id="groupCheckboxContainer" style="display:none;">       
        <label><input type="checkbox" id="checkUncheckAll" value="all"> Check/Uncheck All</label>
        <!-- Group checkboxes will be dynamically added here -->
    </div>
    
    <div class="header-pair">
        <input type="text" name="headerName" placeholder="Header Name">
        <input type="text" name="headerValue" placeholder="Header Value">
    </div>    
    
     
    <button type="button" id="add-more">Add More Headers</button>
	<button type="button" id="fetchPlaylistGroups">Choose Groups</button>
    <button type="submit">Generate Playlist URL</button>
    </form>

    <center><h4>Generated Playlist URL:</h4></center>

    <textarea id="result" rows="4" cols="80" readonly></textarea>
    <div class="container">
        <p>Once the URL has been generated, you can use a URL shortener like <a href="https://tinyurl.com" target="_blank">TinyURL.com</a> to shorten it. This will make it much easier to add the URL as a M3U playlist within your IPTV application.</p>
        <div class="container" id="firewall-warning"></div>
    </div>

    <div class="footer">Created by <a href="https://github.com/dtankdempse/m3u-playlist-proxy">Tank Dempse</a></div>

    <div id="help-overlay">
        <div id="help-content">
            <span id="close-help">&times;</span>
            
    <h4>Adding Playlist URL(s)</h4>

    <p>When adding multiple playlist URLs, separate them with a comma. This will merge all playlists into a single combined list. If multiple EPGs are defined in the playlists using the <code>url-tvg</code> tag, they will also be merged into a single EPG file.</p>

    <strong>Example:</strong>
    <pre>
http://example.com/playlist1.m3u8,http://example.com/playlist2.m3u8,http://example.com/playlist3.m3u8
    </pre>

    <p>The example above will merge three playlists into a single playlist.</p>

    <h4>Merge EPGs</h4> 

    <p>When checked, this option combines EPG sources (specified by <code>tvg-url</code>) into a single EPG file if more than one playlist is used. If only one playlist is used, the <code>tvg-url</code> will remain untouched. This provides a consolidated channel guide across merged playlists. Leaving this unchecked removes all <code>tvg-url</code> tags when multiple sources are detected, helping to reduce bandwidth usage. This is especially useful on free-tier services like Vercel.</p>
	
	<h4>Select Groups</h4> 

    <p>The Select Groups can be used to filter out channels from the playlist based on the group titles. First click on the Choose Groups button to fetch the playlist, the grpups will then be listed. Check the box next to each group you want to include in the playlist; any unchecked boxes will be excluded from the playlist.</p>

    <h4>Headers in the Playlist</h4>
    <p>If specific headers for applications like VLC, TiviMate, or Kodi are included within the playlist, MPP will use those headers to proxy the individual streams. This means the headers embedded in the playlist itself will be utilized directly when accessing a particular stream.</p>

    <h4>Headers in the Header Fields</h4>
    <p>If no headers are present within the playlist for a given stream, MPP will fall back to using the headers specified in the "Header Name / Value" fields of the form. This allows for a default set of headers to be used when the playlist lacks specific instructions.</p>

    <h4>No Headers Set</h4>
    <p>If neither the playlist nor the "Header Name / Value" fields provide any headers, the streams will be accessed without any headers, essentially passing through unmodified, which means they won't be explicitly proxied by MPP.</p>

    <h4>Priority System for Headers</h4>
    <p>Overall, MPP outlines a priority system for using headers:</p>
    <ol>
        <li>Headers embedded in the playlist.</li>
        <li>Headers provided via form input.</li>
        <li>No headers at all.</li>
    </ol>
    
    <h4>Supported Formats</h4>
    <p>The following are supported formats for specifying headers within a playlist:</p>

    <strong>Format Example 1:</strong>
    <pre>
#EXTINF:-1,Channel Name 
http://example.com/playlist.m3u8|Referer="http://example.com"|User-Agent="VLC/3.0.20 LibVLC/3.0.20"
    </pre>

    <strong>Format Example 2:</strong>
    <pre>
#EXTINF:-1,Channel Name 
http://example.com/playlist.m3u8|Referer=http://example.com|User-Agent=VLC/3.0.20 LibVLC/3.0.20
    </pre>

    <strong>Format Example 3:</strong>
    <pre>
#EXTINF:-1,Channel Name
http://example.com/playlist.m3u8|Referer=http%3A%2F%2Fexample.com&User-Agent=VLC%2F3.0.20%20LibVLC%2F3.0.20
    </pre>

    <strong>Format Example 4:</strong>
    <pre>
#EXTINF:-1,Channel Name
#EXTVLCOPT:http-referrer=http://example.com
#EXTVLCOPT:http-user-agent=VLC/3.0.20 LibVLC/3.0.20
http://example.com/playlist.m3u8
    </pre>
        </div>
    </div>

    <script>
        document.getElementById('add-more').addEventListener('click', function () {
            const headerPair = document.createElement('div');
            headerPair.classList.add('header-pair');
            headerPair.innerHTML = 
                "<input type='text' name='headerName' placeholder='Header Name'>" +
                "<input type='text' name='headerValue' placeholder='Header Value'>";
            document.getElementById('headerForm').insertBefore(headerPair, document.getElementById('add-more'));
        });

        document.getElementById('checkUncheckAll').addEventListener('change', function () {
            const isChecked = this.checked;
            document.querySelectorAll('.group-checkbox').forEach(checkbox => checkbox.checked = isChecked);
        });

        document.getElementById('fetchPlaylistGroups').addEventListener('click', function (event) {
            document.getElementById('label-checkbox-container').style.display = 'block';
            event.preventDefault(); // Prevent any form submission triggered by button click

            const playlistUrl = document.getElementById('playlistUrl').value.trim();
            if (!playlistUrl) {
                alert('Please enter a Playlist URL to fetch groups.');
                return;
            }

            const urls = playlistUrl.split(',').map(url => url.trim());
            const groupTitles = new Set();

            function fetchPlaylist(url) {
                return fetch('/fetch?url=' + encodeURIComponent(url), {
                    method: 'GET'
                })
                .then(response => response.text())
                .then(data => {
                    if (data.includes('<a href="')) {
                        const redirectUrlMatch = data.match(/<a href="(.*?)"/);
                        if (redirectUrlMatch) {
                            return fetchPlaylist(redirectUrlMatch[1]);
                        }
                    } 
                    const regex = /group-title="(.*?)"/gi;
                    let match;
                    while ((match = regex.exec(data)) !== null) {
                        groupTitles.add(match[1]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching the playlist:', error);
                    alert('Failed to fetch the playlist. Please check the URL and try again.');
                });
            }

            Promise.all(urls.map(url => fetchPlaylist(url))).then(() => {
                const groupContainer = document.getElementById('groupCheckboxContainer');
                groupContainer.style.display = 'block';
                groupContainer.innerHTML = '<label><input type="checkbox" id="checkUncheckAll" value="all"> Check/Uncheck All</label>';
                Array.from(groupTitles).sort().forEach(group => {
                    const label = document.createElement('label');
                    label.innerHTML = '<input type="checkbox" class="group-checkbox" value="' + group + '" checked> ' + group;
                    groupContainer.appendChild(label);
                });

                document.getElementById('checkUncheckAll').addEventListener('change', function () {
                    const isChecked = this.checked;
                    document.querySelectorAll('.group-checkbox').forEach(checkbox => checkbox.checked = isChecked);
                });
            });
        });

        document.getElementById('headerForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const playlistUrl = document.getElementById('playlistUrl').value.trim();
            if (!playlistUrl) {
                alert('Please enter a Playlist URL.');
                return;
            }

            // Collect headers
            let headers = [];
            const headerPairs = document.querySelectorAll('.header-pair');

            headerPairs.forEach(pair => {
                const headerName = pair.querySelector('input[name="headerName"]').value;
                const headerValue = pair.querySelector('input[name="headerValue"]').value;
                if (headerName && headerValue) {
                    headers.push(headerName + "=" + headerValue);
                }
            });

            const baseUrl = window.location.origin;
            let fullUrl = baseUrl + "/playlist?url=" + encodeURIComponent(playlistUrl);

            // Encode headers if present
            if (headers.length > 0) {
                const headerString = headers.join('|');
                const base64Encoded = btoa(headerString);
                const urlEncodedData = encodeURIComponent(base64Encoded);
                fullUrl += "&data=" + urlEncodedData;
            }

            // Check if epgMerging is checked, and add it to the URL
            const epgMergingChecked = document.getElementById('epgMerging').checked;
            if (epgMergingChecked) {
                fullUrl += "&epgMerging=true";
            }

            // Collect unchecked group titles for exclusion
            let excludedGroups = [];
            document.querySelectorAll('.group-checkbox').forEach(checkbox => {
                if (!checkbox.checked) {
                    excludedGroups.push(checkbox.value);
                }
            });

            if (excludedGroups.length > 0) {
                fullUrl += "&exclude=" + encodeURIComponent(excludedGroups.join(','));
            }

            document.getElementById('result').value = fullUrl;
        });

        document.addEventListener('DOMContentLoaded', function() {
            const host = window.location.hostname;
            if (host === 'localhost' || host === '127.0.0.1') {
                const warning = document.createElement('div');
                warning.classList.add('container');
                warning.style.color = '#ff4e4e';
                warning.style.fontSize = '20px';
                warning.style.textAlign = 'center';
                warning.style.fontWeight = 'bold';
                warning.innerHTML = '<p>Warning: If you are accessing this page via <code>127.0.0.1</code> or <code>localhost</code>, proxying will not work on other devices. Please load this page using your computers IP address (e.g., <code>192.168.x.x</code>) and port in order to access the playlist from other devices on your network.</p><p>How to locate ip address on <a href="https://www.youtube.com/watch?v=UAhDHXN2c6E" target="_blank">Windows</a> or <a href="https://www.youtube.com/watch?v=gaIYP4TZfHI" target="_blank">Linux</a>.</p>';
                document.body.insertBefore(warning, document.body.firstChild);
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
            const warningMessage = 
            '<p>Also, ensure that port <strong>' + port + '</strong> is open and allowed through your Windows (<a href="https://youtu.be/zOZWlTplrcA?si=nGXrHKU4sAQsy18e&t=18" target="_blank">how to</a>) or Linux  (<a href="https://youtu.be/7c_V_3nWWbA?si=Hkd_II9myn-AkNnS&t=12" target="_blank">how to</a>) firewall settings. This will enable other devices, such as Firestick, Android, and others, to connect to the server and request the playlist through the proxy.</p>';
            
            document.getElementById('firewall-warning').innerHTML = warningMessage;
        });

        document.getElementById('help-button').addEventListener('click', function() {
            document.getElementById('help-overlay').style.display = 'flex';
        });

        document.getElementById('close-help').addEventListener('click', function() {
            document.getElementById('help-overlay').style.display = 'none';
        });

        document.getElementById('help-overlay').addEventListener('click', function(event) {
            if (event.target === document.getElementById('help-overlay')) {
                document.getElementById('help-overlay').style.display = 'none';
            }
        });
    </script>
</body>
</html>
`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

	if (parsedUrl.pathname === '/fetch') {
		const targetUrl = parsedUrl.query.url;

		if (!targetUrl) {
			res.writeHead(400, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Missing URL parameter' }));
			return;
		}

		try {
			const protocol = targetUrl.startsWith('https') ? https : http;

			protocol.get(targetUrl, (response) => {
				let data = '';

				response.on('data', chunk => {
					data += chunk;
				});

				response.on('end', () => {
					if (!res.headersSent) {
						res.writeHead(200, { 'Content-Type': 'text/plain' });
						res.end(data);
					}
				});
			}).on('error', (e) => {
				if (!res.headersSent) {
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: e.message }));
				}
			});

		} catch (error) {
			if (!res.headersSent) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: error.message }));
			}
		}

		return; 
	}


	if (pathname === '/playlist') {
	  const urlParam = query.url;
	  const dataParam = query.data || null;
	  const epgMerging = query.epgMerging === 'true';

	  if (!urlParam) {
		res.writeHead(400, { 'Content-Type': 'text/plain' });
		res.end('URL parameter missing');
		return;
	  }

	  await handlePlaylistRequest(req, res, urlParam, dataParam, epgMerging);
	  return;
	}
	
	if (pathname === '/Epg') {
		const dataParam = query.data;
		if (!dataParam) {
		  res.writeHead(400, { 'Content-Type': 'text/plain' });
		  return res.end('Data parameter missing');
		}

		try {
		  const mergedEpg = await epgMerger(dataParam);
		  res.writeHead(200, { 'Content-Type': 'application/xml' });
		  res.end(mergedEpg);
		} catch (error) {
		  console.error('Error in epgMerger:', error);
		  res.writeHead(500, { 'Content-Type': 'text/plain' });
		  res.end('Failed to merge EPGs');
		}
		return;
	}

    let requestUrl = query.url ? decodeURIComponent(query.url) : null;
    let secondaryUrl = query.url2 ? decodeURIComponent(query.url2) : null;
    let data = query.data ? Buffer.from(query.data, 'base64').toString() : null;
    const isMaster = !query.url2;
    let finalRequestUrl = isMaster ? requestUrl : secondaryUrl;

    if (finalRequestUrl) {
      if (query.key && query.key === 'true') {
        await fetchEncryptionKey(res, finalRequestUrl, data);
        return;
      }
	  
	  
			// Handle Streamed.Su URL
			if (finalRequestUrl.includes('vipstreams.in')) {
				if (finalRequestUrl.includes('playlist.m3u8') && !finalRequestUrl.includes('&su=1') && !finalRequestUrl.includes('?id=')) {
					const path = finalRequestUrl.replace('https://rr.vipstreams.in/', '');
					const ua = new UserAgents().toString();
					const base64UA = Buffer.from(ua).toString('base64');
					const urlEncodedUA = encodeURIComponent(base64UA);
					const token = await StreamedSUgetSessionId(path, ua);
					finalRequestUrl = finalRequestUrl.replace('playlist.m3u8', `playlist.m3u8?id=${token}`);
					requestUrl = encodeURIComponent(finalRequestUrl);
					const protocol = req.headers['x-forwarded-proto']?.split(',')[0] || (req.socket.encrypted ? 'https' : 'http');
					const reqFullUrl = `${protocol}://${req.headers.host}${req.url}`;
					const parsedUrl = new URL(reqFullUrl);
					const proxyUrl = `${protocol}://${req.headers.host}`;
					const fullUrl = `${proxyUrl}?url=${requestUrl}&data=${encodeURIComponent(Buffer.from(data).toString('base64'))}&su=1&suToken=${token}&ua=${urlEncodedUA}&type=/index.m3u8`;
					res.writeHead(302, { Location: fullUrl });
					res.end();
					return;
				} else if (query.su === '1' && query.suToken && query.ua) {
					const ua = Buffer.from(query.ua, 'base64').toString('utf-8');
					StreamedSUtokenCheck(query.suToken, ua).catch(err => console.error('Error in StreamedSUtokenCheck:', err));
				}
			}

      const dataType = isMaster ? 'text' : 'binary';
      const result = await fetchContent(finalRequestUrl, data, dataType);

      //console.log("Fetched content length:", result.content.length);

      if (result.status >= 400) {
        res.writeHead(result.status, { 'Content-Type': 'text/plain' });
        res.end(`Error: ${result.status}`);
        return;
      }

      let content = result.content;
      //console.log("Initial content:", content);

      if (isMaster) {
        const baseUrl = new URL(result.finalUrl).origin;
				const protocol = req.headers['x-forwarded-proto']?.split(',')[0] || (req.socket.encrypted ? 'https' : 'http');
				const reqFullUrl = `${protocol}://${req.headers.host}${req.url}`;
				const parsedUrl = new URL(reqFullUrl);
				const proxyUrl = `${protocol}://${req.headers.host}`;
        content = rewriteUrls(content, finalRequestUrl, proxyUrl, query.data);
        //console.log("Processed content:", content);
      }
      
      //console.log("Returned content:", content);
      
      res.writeHead(result.status, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Content-Length': Buffer.byteLength(content)
      });
      res.end(content);
      return;
    }

    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
  } catch (err) {
    console.error('Error handling request:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
}).listen(4123, '0.0.0.0', () => {
  console.log('Server is running on port 4123');
});

// Fetch content from URL
async function fetchContent(url, data, dataType = 'text') {
  try {
    const headers = {};

    if (data) {
      const headersArray = data.split('|');
      headersArray.forEach(header => {
        const [key, value] = header.split('=');
        headers[key.trim()] = value.trim().replace(/['"]/g, '');
      });
    }

    const response = await fetchUrl(url, headers);
    const buffer = response.content;
    let content;

    if (dataType === 'binary') {
      content = buffer;
    } else {
      content = buffer.toString('utf-8');
    }

    return {
      content,
      finalUrl: response.finalUrl || url,
      status: response.status,
      headers: response.headers,
    };
  } catch (err) {
    console.error('Error in fetchContent:', err);
    return { content: null, status: 500, headers: {} };
  }
}

// Fetch URL and handle redirects
function fetchUrl(requestUrl, headers, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    try {
      if (redirectCount > 10) {
        return reject(new Error('Too many redirects'));
      }

      const parsedUrl = url.parse(requestUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method: 'GET',
        headers: headers || {},
      };

      const httpModule = isHttps ? require('https') : require('http');
      const req = httpModule.request(options, res => {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          const statusCode = res.statusCode;

          if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
            const redirectUrl = url.resolve(requestUrl, res.headers.location);
            return fetchUrl(redirectUrl, headers, redirectCount + 1).then(resolve).catch(reject);
          }

          resolve({
            content: Buffer.concat(data),
            finalUrl: requestUrl,
            status: statusCode,
            headers: res.headers,
          });
        });
      });

      req.on('error', reject);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Handle playlist requests
async function handlePlaylistRequest(req, res, playlistUrl, data, epgMergingEnabled) {
  try {
    const urls = playlistUrl.split(',');
    let combinedContent = '';
    const epgUrls = new Set();

		// Get the full URL of the request
		const reqFullUrl = `${req.protocol}://${req.headers.host}${req.url}`;
		const parsedUrl = new URL(reqFullUrl);
		const protocol = req.headers['x-forwarded-proto']?.split(',')[0] || (req.socket.encrypted ? 'https' : 'http');

    const baseUrl = new URL(req.url, `${protocol}://${req.headers.host}`).origin;

    // Extract exclude parameter if provided
    const excludeParam = new URL(req.url, `${protocol}://${req.headers.host}`).searchParams.get('exclude');
    const excludeGroups = excludeParam ? excludeParam.split(',').map(decodeURIComponent) : [];

    for (const url of urls) {
      console.log("Fetching playlist URL: " + url.trim());
      const result = await fetchContent(url.trim(), null, 'text');
      if (result.status !== 200) continue;

      let playlistContent = result.content;

      const epgMatch = playlistContent.match(/#EXTM3U.*?url-tvg="(.*?)"/);
      if (epgMatch && epgMatch[1]) {
        epgUrls.add(epgMatch[1]);
        playlistContent = playlistContent.replace(epgMatch[0], '');
      } else {
        playlistContent = playlistContent.replace(/^#EXTM3U\s*\n?/, '');
      }

      // Remove channels based on exclude parameter
      if (excludeGroups.length > 0) {
        const lines = playlistContent.split('\n');
        let filteredContent = '';
        let skip = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.startsWith('#EXTINF')) {
            const groupTitleMatch = line.match(/group-title="(.*?)"/);
            if (groupTitleMatch && excludeGroups.includes(groupTitleMatch[1])) {
              skip = true;
            } else {
              skip = false;
            }
          }

          if (!skip) {
            filteredContent += line + '\n';
          }
        }

        playlistContent = filteredContent.trim();
      }

      playlistContent = rewritePlaylistUrls(playlistContent, baseUrl, data);
      combinedContent += playlistContent + '\n';
    }

    if (epgUrls.size > 1 && epgMergingEnabled) {
      // Merge EPGs if epgMerging is enabled and there are multiple EPGs
      const epgString = Array.from(epgUrls).join(',');
      const encodedEpg = Buffer.from(epgString).toString('base64');
      const rewrittenEpgUrl = `${baseUrl}/Epg?data=${encodedEpg}`;
      combinedContent = `#EXTM3U url-tvg="${rewrittenEpgUrl}"
${combinedContent.trim()}`;
    } else if (epgUrls.size === 1) {
      // Use a single EPG URL if only one exists
      const singleEpgUrl = Array.from(epgUrls)[0];
      combinedContent = `#EXTM3U url-tvg="${singleEpgUrl}"
${combinedContent.trim()}`;
    } else if (epgUrls.size > 1 && !epgMergingEnabled) {
      // Strip EPG URLs if multiple are present and merging is disabled
      combinedContent = `#EXTM3U
${combinedContent.trim()}`;
    } else {
      combinedContent = `#EXTM3U
${combinedContent.trim()}`;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(combinedContent.trim());
  } catch (err) {
    console.error('Error in handlePlaylistRequest:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    return res.end('Error processing playlist');
  }
}

// Fetch encryption key
async function fetchEncryptionKey(res, url, data) {
  try {
    const result = await fetchContent(url, data, 'binary');

    if (result.status >= 400) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Failed to fetch encryption key: ${result.status}`);
    }

    res.writeHead(200, result.headers);
    return res.end(result.content);
  } catch (err) {
    console.error('Error in fetchEncryptionKey:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    return res.end('Error fetching encryption key');
  }
}

// Rewrite URLs in the M3U8 playlist
function rewriteUrls(content, requestUrl, proxyUrl, data) {
  try {
    console.log(`Request URL: ${requestUrl}`);

    // Determine the base path (directory of the request URL)
    const urlObj = new URL(requestUrl);
    const baseUrl = `${urlObj.origin}${urlObj.pathname.replace(/\/[^/]*$/, '/')}`;
    //console.log(`Determined baseUrl: ${baseUrl}`);

    const lines = content.split('\n');
    const rewrittenLines = [];
    let isNextLineMasterPlaylist = false;

    lines.forEach((line, index) => {
      line = line.trim();
      //console.log(`Processing line: ${line}`);

      if (line.startsWith('#')) {
        // Handle URI attributes in EXT-X-KEY
        if (line.includes('URI="')) {
          const uriMatch = line.match(/URI="([^"]+)"/i);
          if (uriMatch && uriMatch[1]) {
            let uri = uriMatch[1];

            if (!uri.startsWith('http')) {
              uri = new URL(uri, baseUrl).href;
              //console.log(`Resolved relative URI to: ${uri}`);
            }

            const rewrittenUri = `${proxyUrl}?url=${encodeURIComponent(uri)}&data=${encodeURIComponent(data)}${line.includes('#EXT-X-KEY') ? '&key=true' : ''}`;
            line = line.replace(uriMatch[1], rewrittenUri);
            //console.log(`Rewritten URI: ${rewrittenUri}`);
          }
        }

        rewrittenLines.push(line);

        // Flag the next line as master playlist or segment
        if (line.includes('#EXT-X-STREAM-INF')) {
          isNextLineMasterPlaylist = true;
        } else {
          isNextLineMasterPlaylist = false;
        }
      } else if (line.trim() && !line.startsWith('#')) {
        // Determine the type of URL
        const isMasterPlaylist = isNextLineMasterPlaylist || line.includes('.m3u8');
        const isSegment = !isMasterPlaylist; // Default to segment if not master

        const urlParam = isSegment ? 'url2' : 'url';
        let lineUrl = line;

        if (!lineUrl.startsWith('http')) {
          // Resolve relative paths for URLs
          lineUrl = new URL(lineUrl, baseUrl).href;
          //console.log(`Resolved relative line URL to: ${lineUrl}`);
        }

        const fullUrl = `${proxyUrl}?${urlParam}=${encodeURIComponent(lineUrl)}&data=${encodeURIComponent(data)}${isSegment ? '&type=/index.ts' : '&type=/index.m3u8'}`;
        rewrittenLines.push(fullUrl);
        //console.log(`Rewritten line URL: ${fullUrl}`);

        isNextLineMasterPlaylist = false;
      } else {
        rewrittenLines.push(line);
      }
    });

    return rewrittenLines.join('\n');
  } catch (err) {
    console.error('Error in rewriteUrls:', err);
    return content;
  }
}

// Dedicated fetch for EPG's
function fetchEpgContent(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      const statusCode = response.statusCode;
      const headers = response.headers || {};

      if (statusCode !== 200) {
        response.resume(); 
        return reject(new Error(`Request failed with status code: ${statusCode}`));
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const encoding = headers['content-encoding'] || ''; // Ensure encoding is defined

        try {
          let content;
          if (encoding.includes('gzip')) content = zlib.gunzipSync(buffer);
          else if (encoding.includes('deflate')) content = zlib.inflateSync(buffer);
          else content = buffer;

          resolve(content.toString('utf-8'));
        } catch (decompressionError) {
          reject(new Error(`Decompression failed: ${decompressionError.message}`));
        }
      });
    }).on('error', (error) => reject(error));
  });
}

// Rewrite playlist URLs and encode headers
function rewritePlaylistUrls(content, baseUrl, data) {
  try {
    const lines = content.split('\n');
    const rewrittenLines = [];
    let vlcHeaders = [];

    lines.forEach((line, index) => {
      if (line.startsWith('#EXTINF')) {
        rewrittenLines.push(line);
      } else if (line.startsWith('http') && !line.includes('inputstream.adaptive')) {
        const headerSeparatorIndex = line.indexOf('|');
        const streamUrl = headerSeparatorIndex !== -1 ? line.substring(0, headerSeparatorIndex) : line;

        let base64Data = '';

        // Handling Kodi and Tivimate playlist headers
        if (headerSeparatorIndex !== -1) {
          const headersString = line.substring(headerSeparatorIndex + 1);
          const decodedHeadersString = decodeURIComponent(headersString);
          const headers = decodedHeadersString
            ? decodedHeadersString.split('&').map(header => {
              const [key, ...valueParts] = header.split('=');
              let cleanKey = key.trim();
              const cleanValue = valueParts.length > 0 ? valueParts.join('=').replace(/^['"]|['"]$/g, '').trim() : '';

              // Dynamically adjust the header keys for VLC format
              if (cleanKey === 'referrer') {
                cleanKey = 'Referer';
              }

              return `${cleanKey}=${cleanValue}`;
            })
            : [];

          base64Data = headers.length > 0 ? Buffer.from(headers.join('|')).toString('base64') : '';
        } else if (vlcHeaders.length > 0) {
          // Use VLC headers if available
          const formattedVlcHeaders = vlcHeaders.map(header => {
            const [key, value] = header.split('=');
            let cleanKey = key.replace('http-', '').trim();
            if (cleanKey === 'referrer') cleanKey = 'Referer';
            const capitalizedKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
            const cleanValue = value ? value.replace(/^['"]|['"]$/g, '').trim() : '';
            return `${capitalizedKey}=${cleanValue}`;
          });
          base64Data = Buffer.from(formattedVlcHeaders.join('|')).toString('base64');
          vlcHeaders = [];
        } else if (data) {
          base64Data = data;
        }

        if (base64Data) {
          const newUrl = `${baseUrl}?url=${encodeURIComponent(streamUrl)}&data=${encodeURIComponent(base64Data)}`;
          rewrittenLines.push(newUrl);
        } else {
          // If no headers and data is null, do not rewrite the line
          rewrittenLines.push(line);
        }
      } else if (line.startsWith('#EXTVLCOPT:http-')) {
        // Handling VLC playlist headers
        const headerSeparatorIndex = line.indexOf(':');
        if (headerSeparatorIndex !== -1) {
          const header = line.substring(headerSeparatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
          vlcHeaders.push(header);
        }
      } else if (line.includes('inputstream.adaptive')) {
        // Leave inputstream.adaptive tags alone
        rewrittenLines.push(line);
      } else if (!line.startsWith('#EXTVLCOPT') && !line.startsWith('#KODIPOP')) {
        // Exclude EXTVLCOPT and KODIPOP lines
        rewrittenLines.push(line);
      }
    });

    return rewrittenLines.join('\n');
  } catch (err) {
    console.error('Error in rewritePlaylistUrls:', err);
    return content;
  }
}

// Merge multiple epg's into one.
async function epgMerger(encodedData) {
  const urls = Buffer.from(encodedData, 'base64').toString('utf-8').split(',');
  let mergedEpg = '';

  for (const url of urls) {
    try {
      const epgContent = await fetchEpgContent(url.trim());
      mergedEpg += epgContent.replace(/<\?xml.*?\?>/, '').replace(/<\/?tv>/g, '');
    } catch (error) {
      console.error('Failed to fetch or parse EPG:', error);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?><tv>${mergedEpg}</tv>`;
}

// ----- Streamed.Su Functions ----- //

async function StreamedSUgetSessionId(path, ua) {
  const sessionKey = getSessionKey(path);
  const currentTime = Date.now();
  const sessionData = await getSessionToken(sessionKey);

  if (sessionData) {
    const lastChecked = await getLastCheckedTimestamp(sessionData.token);

    if (currentTime - sessionData.timestamp < 2 * 60 * 60 * 1000 && lastChecked && currentTime - lastChecked < 30000) {
      console.log('Using cached Streamed Su Token:', sessionData.token);
      return sessionData.token;
    } else {
      console.log('Token expired or not checked recently enough. Creating new token...');
    }
  }

  const targetUrl = "https://secure.embedme.top/init-session";
  const sendPath = '/' + path;
	console.log('User-Agent: ', ua);
  console.log('Fetching new Streamed Su Token for path:', sendPath);

  try {
    const postData = JSON.stringify({ path: sendPath });

    const options = {
      hostname: "secure.embedme.top",
      path: "/init-session",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ua,
				"Accept": "*/*",
				"Accept-Language": "en-US,en;q=0.5",
				"Referer": "https://embedme.top/",
				"Origin": "https://embedme.top",
				"Connection": "keep-alive",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-site",
				"Priority": "u=4",
				"Pragma": "no-cache",
				"Cache-Control": "no-cache",
      },
    };

    const token = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const responseData = JSON.parse(data);
            console.log('Fetched new Streamed Su Token:', responseData.id);
            resolve(responseData.id);
          } else {
            reject(new Error(`Failed to fetch session data: ${res.statusCode}`));
          }
        });
      });

      req.on("error", (error) => reject(error));
      req.write(postData);
      req.end();
    });

    await setSessionToken(sessionKey, token, currentTime);
    return token;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function StreamedSUtokenCheck(token, ua) {
  const currentTime = Date.now();
  const lastChecked = await getLastCheckedTimestamp(token);
  if (lastChecked && currentTime - lastChecked < 15000) {
    console.log(`Skipping StreamedSUtokenCheck for ${token} due to recent check.`);
    return null;
  }

  const options = {
    hostname: "secure.embedme.top",
    path: `/check/${token}`,
    method: "GET",
    headers: {
      "User-Agent": ua,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Referer": "https://embedme.top/",
      "Origin": "https://embedme.top",
      "Connection": "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Priority": "u=4",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
    },
  };

  console.log('User-Agent:', ua);
  console.log('Checking Streamed Su Token:', token);

  return new Promise((resolve, reject) => {
    const req = https.request(options, async (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", async () => {
        if (res.statusCode === 200) {
          await setLastCheckedTimestamp(token, currentTime);
          resolve(data);
        } else if (res.statusCode === 429) {
          console.error("Rate limit exceeded: 429 error.");
          resolve(null);
        } else if (res.statusCode === 400) {
          console.error("Invalid token detected.");
          await setLastCheckedTimestamp(token, currentTime - 30000);
          resolve(null);
        } else {
          reject(new Error(`Failed to check token: ${res.statusCode}`));
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.end();
  });
}

function initializeStorage() {
  if (process.env.VERCEL) return require('@vercel/kv');
  if (process.env.REDIS_URL) return new Redis(process.env.REDIS_URL);
  return null;
}

function getSessionKey(path) {
  const parts = path.split('/');
  return parts.slice(0, 5).join('/');
}

async function getSessionToken(path) {
  const key = `sessionToken:${path}`;
  if (storage && storage.get) {
    const tokenData = await storage.get(key);
    return tokenData ? JSON.parse(tokenData) : null;
  }
  return sessionTokens[key];
}

async function setSessionToken(path, token, timestamp) {
  const key = `sessionToken:${path}`;
  const tokenData = JSON.stringify({ token, timestamp });
  if (storage && storage.set) {
    await storage.set(key, tokenData);
  } else {
    sessionTokens[key] = { token, timestamp };
  }
}

async function getLastCheckedTimestamp(token) {
  if (storage && storage.get) return await storage.get(`lastCheckedTimestamp:${token}`);
  return lastCheckedTimestamps[token];
}

async function setLastCheckedTimestamp(token, timestamp) {
  if (storage && storage.set) await storage.set(`lastCheckedTimestamp:${token}`, timestamp);
  else lastCheckedTimestamps[token] = timestamp;
}

