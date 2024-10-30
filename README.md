# What is the M3U Playlist Proxy

The M3U Playlist Proxy is a lightweight and effective tool designed to forward essential headers to proxy M3U playlist streams. Acting as a bridge between your client and the server, it ensures that important headers (such as User-Agent, Referer, etc.) are accurately passed along. This setup allows IPTV applications to reliably access streams that need specific headers in place.

**Note:** Ensure that you use only the standard M3U8 playlist (playlist.m3u8) when setting up the M3U Playlist Proxy. Other formats, such as TiviMate, Kodi, and VLC, are not compatible and will not work with this setup.

## Recommended Setup for Windows Users

For Windows users, this is the recommended method to use the M3U Playlist Proxy

https://github.com/user-attachments/assets/5888656b-1dee-4dd2-8494-541c2934657d

Simply download and extract the ZIP file, then run the setup_service.bat. This will install the m3u-playlist-proxy as a Windows service, allowing it to run seamlessly in the background. If you're not using a Windows machine or prefer a different setup, feel free to use one of the other options below.

[![Download ZIP](https://img.shields.io/badge/Download-ZIP-brightgreen)](https://github.com/dtankdempse/m3u-playlist-proxy/raw/refs/heads/main/win/m3u-playlist-proxy.zip)

## Setup with Docker

The M3U Playlist Proxy is also available as a Docker image, allowing you to easily deploy it in a containerized environment. By using Docker, you can quickly start the proxy without needing to install dependencies or manually configure the environment.

### Pulling the Docker Image

To get started, pull the latest version of the M3U Playlist Proxy Docker image with the following command:

`docker pull dtankdemp/m3u-playlist-proxy:latest`

### Running the M3U Playlist Proxy Container

Once you’ve pulled the image, you can start the container using:

`docker run -d -p <port>:4123 dtankdemp/m3u-playlist-proxy:latest`

This command runs the proxy on port 4123, allowing your IPTV application to connect to it locally or remotely (depending on your setup) to access M3U playlist streams with the necessary headers correctly forwarded. Adjust the port if needed, based on your environment.
