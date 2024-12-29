![License](https://img.shields.io/github/license/dtankdempse/m3u-playlist-proxy)
![Stars](https://img.shields.io/github/stars/dtankdempse/m3u-playlist-proxy?style=social)
![Forks](https://img.shields.io/github/forks/dtankdempse/m3u-playlist-proxy?style=social)
![Issues](https://img.shields.io/github/issues/dtankdempse/m3u-playlist-proxy)

# 🎬 M3U Playlist Proxy

The **M3U Playlist Proxy** is a lightweight and effective tool designed to forward essential headers to proxy M3U playlist streams. Acting as a bridge between your client and the server, it ensures that important headers (such as `User-Agent`, `Referer`, etc.) are accurately passed along. This setup allows IPTV applications to reliably access streams that need specific headers in place.

### 📂 **Supported Formats**

The M3U Playlist Proxy supports the following M3U formats when looking for the required headers for streaming.:

- **Standard**
- **TiviMate**
- **Kodi**
- **VLC**

You can now use any of these formats when loading playlists into MPP.

## 🖥️ Recommended Setup for Windows Users

For Windows users, this is the recommended method to use the M3U Playlist Proxy.

https://github.com/user-attachments/assets/5888656b-1dee-4dd2-8494-541c2934657d

1. **Download and Extract:**

   [![Download ZIP](https://img.shields.io/badge/Download-ZIP-brightgreen)](https://github.com/dtankdempse/m3u-playlist-proxy/raw/refs/heads/main/win/m3u-playlist-proxy.zip)

2. **Run the Setup:**

   Extract the ZIP file and run `setup_service.bat`. This will install the `m3u-playlist-proxy` as a Windows service, allowing it to run seamlessly in the background.

If you're not using a Windows machine or prefer a different setup, feel free to use one of the other options below.

---

## ☁️ Deploy to Vercel (Ideal for Users Without a Computer)

Vercel’s free tier includes **100 GB** of bandwidth and **1,000 build minutes** per month, making it an excellent option for deploying the M3U Playlist Proxy. This allocation is more than enough to manage personal stream proxying and development needs efficiently.

https://github.com/user-attachments/assets/4fd3c242-b1d0-4f2b-bccb-d0b98b8ba94e

Click the button below to deploy this project to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/dtankdempse/m3u-playlist-proxy)

### 🚀 Steps to Deploy:

1. **Click the Deploy Button**:
   - When you click the **Deploy with Vercel** button, you'll be redirected to Vercel's platform. It will automatically import the project template from this GitHub repository.

2. **Log in Using GitHub**:
   - It is recommended to log in to Vercel using a GitHub account. This makes the integration smoother and allows Vercel to access the repository directly. If you don’t have a Vercel account, you can [sign up for free](https://vercel.com/signup).

3. **Configure Project Settings**:
   - After logging in, Vercel will guide you through the project setup. You can review the project name and select the team or personal account under which you want to deploy the project.

4. **Deploy the Project**:
   - After confirming the settings, click **Deploy**. Vercel will automatically build and deploy the project based on the configuration defined in the repository.

5. **View the Live Project**:
   - Once the deployment is complete, you will see a link to access your newly deployed project.

   **⚠️ IMPORTANT**

   If you click the link directly and receive a `400 Bad Request` error, this may be due to a `?vercelToolbarCode=xxxxxx` parameter being added to the URL. Simply remove this parameter from the address bar and reload the page.

---   

## 🐳 Setup with Docker

The M3U Playlist Proxy is also available as a Docker image, allowing you to easily deploy it in a containerized environment. By using Docker, you can quickly start the proxy without needing to install dependencies or manually configure the environment.

### 📥 Pulling the Docker Image

To get started, pull the latest version of the M3U Playlist Proxy Docker image with the following command:

```bash
docker pull dtankdemp/m3u-playlist-proxy:latest
```

### ▶️ Running the M3U Playlist Proxy Container

Once you’ve pulled the image, you can start the container using:

```bash
docker run -d -p <port>:4123 dtankdemp/m3u-playlist-proxy:latest
```

This command runs the proxy on port `4123`, allowing your IPTV application to connect to it locally or remotely (depending on your setup) to access M3U playlist streams with the necessary headers correctly forwarded. Adjust the port if needed, based on your environment.

---

<details>
<summary>Click to read Disclaimer.</summary>

### Disclaimer:

This software is provided "as is," without any warranties or guarantees of any kind, either expressed or implied. Use of this software is at your own risk. The developers are not responsible for any issues, damages, or legal liabilities arising from its use. By using this software, you agree that you are solely responsible for ensuring compliance with applicable laws and regulations, including those related to copyright and intellectual property.

</details>
