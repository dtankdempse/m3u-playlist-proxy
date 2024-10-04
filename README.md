# What is the M3U Playlist Proxy

The M3U Playlist Proxy is a lightweight and effective tool designed to forward essential headers to proxy M3U playlist streams. Acting as a bridge between your client and the server, it ensures that important headers (such as User-Agent, Referer, etc.) are accurately passed along. This setup allows IPTV applications to reliably access streams that need specific headers in place.

## Setup with Cloudflare Worker

Cloudflare Workers allows you to run JavaScript code at the edge, right on Cloudflare's infrastructure, with a generous free tier. A free Cloudflare account offers **100,000 requests per day**, which is **more than enough** to proxy and manage these streams efficiently.

https://github.com/user-attachments/assets/7b4b04a6-00b6-4df9-b09f-0d61f9d16f15

### Steps to Manually Deploy Your Worker

You can easily deploy this Worker to your Cloudflare account by following these steps:

1. Sign up or log in to your Cloudflare account at [https://dash.cloudflare.com/](https://dash.cloudflare.com/).

2. Navigate to **Workers** in the left sidebar.

3. Click **Create a Worker**.

4. Copy the code from the [worker.js](https://github.com/dtankdempse/m3u-playlist-proxy/blob/main/cloudflare/worker.js) file in this repository and paste it into the Cloudflare Workers editor.

5. Save and deploy the Worker.

6. Use the automatically generated Worker URL to start proxying your streams.

## Setup with Docker

The M3U Playlist Proxy is also available as a Docker image, allowing you to easily deploy it in a containerized environment. By using Docker, you can quickly start the proxy without needing to install dependencies or manually configure the environment.

### Pulling the Docker Image

To get started, pull the latest version of the M3U Playlist Proxy Docker image with the following command:

`$ docker pull ghcr.io/dtankdempse/m3u-playlist-proxy:latest`

### Running the M3U Playlist Proxy Container

Once you’ve pulled the image, you can start the container using:

`$ docker run -d -p <port>:4123 ghcr.io/dtankdempse/m3u-playlist-proxy:latest`

This command runs the proxy on port 4242, allowing your IPTV application to connect to it locally or remotely (depending on your setup) to access M3U playlist streams with the necessary headers correctly forwarded. Adjust the port if needed, based on your environment.
