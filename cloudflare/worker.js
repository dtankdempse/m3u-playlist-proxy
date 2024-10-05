addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle the home page route
  if (pathname === '/' && !url.search) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
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

button#add-more {
	background-color: #007bff;
    color: white;
}

button[type="submit"] {
    background-color: #28a745;
    color: white;
}

button:hover {
    opacity: 0.9;
}

button:focus {
    outline: none;
}

/* Styling for Text Area */
textarea {
    width: 100%;
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

h3,h4 {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #626262;
}
form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f7f7f7;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

 .container {
    max-width: 600px;
    margin: 0 auto;
}

 .footer {
    max-width: 600px;
    margin: 0 auto;
    padding-top:20px;
    padding-bottom:10px;
    text-align:center;
}


textarea#result {
    width: 100%;
    max-width: 600px;
    display: block;
    margin: 20px auto;
    padding: 10px;
    font-size: 16px;
    border


/* Label Styling */
label {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
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

    </style>
</head>
<body><h3>M3U Playlist Proxy</h3>
     <div class="container"><p>Use the form below to generate a playlist with the necessary headers. For example, if the server requires a "Referer: http://example.com" header to allow streaming, you would enter "Referer" as the Header Name and "http://example.com" as the Header Value.</p></div>

    <form id="headerForm">
        <div>
            <label for="playlistUrl">Playlist URL:</label><br>
            <input type="text" id="playlistUrl" name="playlistUrl" placeholder="Enter playlist URL" style="width: 96%; margin-bottom: 20px;">
        </div>
        
        <div class="header-pair">
            <input type="text" name="headerName" placeholder="Header Name">
            <input type="text" name="headerValue" placeholder="Header Value">
        </div>
        <button type="button" id="add-more">Add More Headers</button>
        <button type="submit">Generate Playlist URL</button>
    </form>

    <h4>Generated Playlist URL:</h4>
    <textarea id="result" rows="4" cols="80" readonly></textarea>
    <div class="container"><p>Once the URL has been generated, you can use a URL shortener like <a href="https://tinyurl.com" target=_blank">TinyURL.com</a> to shorten it. This will make it much easier to add the URL as a M3U playlist within your IPTV application.</p></div>

<div class="footer">Created by  <a href="https://github.com/dtankdempse/m3u-playlist-proxy">Tank Dempse</a></div>
    <script>
    // Function to add more header input fields
    document.getElementById('add-more').addEventListener('click', function () {
        const headerPair = document.createElement('div');
        headerPair.classList.add('header-pair');
        headerPair.innerHTML = 
            "<input type='text' name='headerName' placeholder='Header Name'>" +
            "<input type='text' name='headerValue' placeholder='Header Value'>";
        document.getElementById('headerForm').insertBefore(headerPair, document.getElementById('add-more'));
    });

    // Function to handle form submission and generate the full URL
    document.getElementById('headerForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const playlistUrl = document.getElementById('playlistUrl').value.trim();
        if (!playlistUrl) {
            alert('Please enter a Playlist URL.');
            return;
        }

        let headers = [];
        const headerPairs = document.querySelectorAll('.header-pair');

        headerPairs.forEach(pair => {
            const headerName = pair.querySelector('input[name="headerName"]').value;
            const headerValue = pair.querySelector('input[name="headerValue"]').value;
            if (headerName && headerValue) {
                headers.push(headerName + "=" + headerValue);
            }
        });

        if (headers.length > 0) {
            const headerString = headers.join('|');
            const base64Encoded = btoa(headerString);
            const urlEncodedData = encodeURIComponent(base64Encoded);
            const baseUrl = window.location.origin;
            const fullUrl = baseUrl + "/playlist?url=" + encodeURIComponent(playlistUrl) + "&data=" + urlEncodedData;

            document.getElementById('result').value = fullUrl;
        } else {
            alert('Please add at least one header.');
        }
    });
</script>

</body>
</html>
    `;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }
  
  // Handle the /playlist route
	if (pathname === '/playlist') {
	  const urlParam = url.searchParams.get('url');
	  const dataParam = url.searchParams.get('data');
	  
	  if (!urlParam) {
		return new Response('URL parameter missing', { status: 400 });
	  }

	  return handlePlaylistRequest(request, urlParam, dataParam);
	}

  // Handle proxied URL requests (same logic as before)
  const params = url.searchParams;
  const requestUrl = params.has('url') ? decodeURIComponent(params.get('url')) : null;
  const secondaryUrl = params.has('url2') ? decodeURIComponent(params.get('url2')) : null;
  const data = params.get('data') ? atob(params.get('data')) : null; // Decode base64

  const isMaster = !params.has('url2'); // Check if it's a master playlist
  const finalRequestUrl = isMaster ? requestUrl : secondaryUrl;

  if (finalRequestUrl) {
    // Handle encryption key requests
    if (params.has('key') && params.get('key') === 'true') {
      return fetchEncryptionKey(finalRequestUrl, data);
    }

    // Set dataType based on whether it's a master playlist (text) or a segment (binary)
    const dataType = isMaster ? 'text' : 'binary';

    // Fetch content from the URL with appropriate headers and dataType
    const result = await fetchContent(finalRequestUrl, data, dataType);

    if (result.status >= 400) {
      return new Response(`Error: ${result.status}`, { status: result.status });
    }

    let content = result.content;

    // If it's a master playlist, rewrite the URLs and treat as text
    if (isMaster) {
      const baseUrl = new URL(result.finalUrl).origin;
      const proxyUrl = `${url.origin}`;
      content = rewriteUrls(content, baseUrl, proxyUrl, params.get('data'));
    }

    // Send the response with content and headers
    return new Response(content, { headers: result.headers, status: result.status });
  }

  return new Response('Bad Request', { status: 400 });
}

// Function to fetch content from a URL using fetch
async function fetchContent(url, data, dataType = 'text') {
  const headers = new Headers();

  if (data) {
    const headersArray = data.split('|');
    headersArray.forEach(header => {
      const [key, value] = header.split('=');
      headers.append(key.trim(), value.trim().replace(/['"]/g, ''));
    });
  }

  const response = await fetch(url, { headers });
  const buffer = await response.arrayBuffer();
  let content;

  if (dataType === 'binary') {
    content = buffer; // Treat as binary
  } else {
    content = new TextDecoder('utf-8').decode(buffer); // Default to text
  }

  return {
    content,
    finalUrl: url,
    status: response.status,
    headers: response.headers,
  };
}

// Function to handle playlist requests
async function handlePlaylistRequest(request, playlistUrl, data) {
  
  const result = await fetchContent(playlistUrl);

  if (result.status !== 200) {
    return new Response('Failed to fetch playlist', { status: 500 });
  }

  let playlistContent = result.content;
  const baseUrl = new URL(request.url).origin;
  playlistContent = rewritePlaylistUrls(playlistContent, baseUrl, data);

  return new Response(playlistContent, { headers: { 'Content-Type': 'text/plain' } });
}

// Function to fetch encryption key
async function fetchEncryptionKey(url, data) {
  const updatedUrl = url.includes('videohls.ru') ? url.replace('videohls.ru', 'onlinehdhls.ru') : url;
  const result = await fetchContent(updatedUrl, data, 'binary'); // Pass 'binary' as the dataType

  if (result.status >= 400) {
    return new Response(`Failed to fetch encryption key: ${result.status}`, { status: 500 });
  }

  return new Response(result.content, { headers: result.headers });
}

// Rewrite URLs in the M3U8 playlist
function rewriteUrls(content, baseUrl, proxyUrl, data) {
  const lines = content.split('\n');
  const rewrittenLines = [];
  let isNextLineUri = false;

  lines.forEach(line => {
    if (line.startsWith('#')) {
      if (line.includes('URI="')) {
        const uriMatch = line.match(/URI="([^"]+)"/i);
        let uri = uriMatch[1];
        
        if (!uri.startsWith('http')) {
          uri = new URL(uri, baseUrl).href;
        }
        
        const rewrittenUri = `${proxyUrl}?url=${encodeURIComponent(uri)}&data=${encodeURIComponent(data)}${line.includes('#EXT-X-KEY') ? '&key=true' : ''}`;
        line = line.replace(uriMatch[1], rewrittenUri);
      }
      
      rewrittenLines.push(line);

      if (line.includes('#EXT-X-STREAM-INF')) {
        isNextLineUri = true;
      }

    } else if (line.startsWith('http') || isNextLineUri) {
      const urlParam = isNextLineUri ? 'url' : 'url2';
      let lineUrl = line;

      if (!lineUrl.startsWith('http')) {
        lineUrl = new URL(lineUrl, baseUrl).href;
      }

      const fullUrl = `${proxyUrl}?${urlParam}=${encodeURIComponent(lineUrl)}&data=${encodeURIComponent(data)}${urlParam === 'url' ? '&type=/index.m3u8' : '&type=/index.ts'}`;
      rewrittenLines.push(fullUrl);

      isNextLineUri = false;
    } else {
      rewrittenLines.push(line);
    }
  });

  return rewrittenLines.join('\n');
}

// Rewrite playlist URLs and encode headers
function rewritePlaylistUrls(content, baseUrl, data) {
  const lines = content.split('\n');
  const rewrittenLines = [];

  lines.forEach(line => {
    if (line.startsWith('#EXTINF')) {
      rewrittenLines.push(line);
    } else if (line.startsWith('http')) {
      const headerSeparatorIndex = line.indexOf('|');
      const streamUrl = headerSeparatorIndex !== -1 ? line.substring(0, headerSeparatorIndex) : line;

      let base64Data = '';

      if (data) {
        base64Data = data; // Use provided data directly if it's passed
      } else if (headerSeparatorIndex !== -1) {
        const headersString = line.substring(headerSeparatorIndex + 1);
        const headers = headersString
          ? headersString.split('|').map(header => {
              const [key, value] = header.split('=');
              const cleanValue = value ? value.replace(/^['"]|['"]$/g, '').trim() : '';
              return `${key.trim()}=${cleanValue}`;
          })
          : [];
        base64Data = headers.length > 0 ? btoa(headers.join('|')) : '';
      }

      const newUrl = `${baseUrl}?url=${encodeURIComponent(streamUrl)}&data=${encodeURIComponent(base64Data)}`;
      rewrittenLines.push(newUrl);
    } else {
      rewrittenLines.push(line);
    }
  });

  return rewrittenLines.join('\n');
}
