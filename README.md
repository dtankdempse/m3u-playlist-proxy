# Streamed su Sports Playlists

Streamed su is a platform that offers live sports streaming on their website. Users can stream and watch sports directly through their browser without the need for an account or subscription.

For added flexibility, this repository provides an M3U playlist featuring Streamed su's channels. With this, you can load the streams into any IPTV application that supports M3U-formatted playlists.

You can view the latest events added to the playlist [here](https://github.com/dtankdempse/streamed-su-sports/blob/main/events.txt).

## M3U-Playlist-Proxy (MPP) Required!

Following recent updates by Streamed Su Sports, using MPP is now necessary to stream this playlist. You can watch a video guide on setting up and downloading the M3U-Playlist-Proxy [here](https://github.com/dtankdempse/m3u-playlist-proxy).

- **Playlist.m3u8**  
  This is a standard M3U playlist. To use it, load the Playlist URL into MPP and ensure both the `Referer` and `User-Agent` headers are correctly configured. Set the `Referer` to `https://embedme.top/` and use a compatible `User-Agent` string to enable stream access. Without these headers, streaming attempts will result in a 403 error.


  - **Playlist URL:** [https://bit.ly/su-m3u1](https://bit.ly/su-m3u1)
  - **EPG URL:** [https://bit.ly/su-epg](https://bit.ly/su-epg)
  - **Required Referer:** `https://embedme.top/`
  - **User-Agent:** `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0`  
    (Alternatively, you may use your own User-Agent string.)

## Playlist and EPG Syncing:

The playlist and EPG data are updated every 4 hours. Since streaming data can change frequently, it’s recommended to sync the refresh of both your playlist and guide information simultaneously in your IPTV application. If you notice 'No information' being displayed in the guide, try manually refreshing the EPG within your application to ensure the most up-to-date data is loaded.

## Sports:

Basketball, Football, American Football, Hockey, Baseball, Motor Sports, Fight (UFC, Boxing), Tennis, Rugby, Golf, Billiards, AFL, Darts, Cricket, Other

## Disclaimer:

This repository has no control over the streams, links, or the legality of the content provided by Streamed.su. It is the end user's responsibility to ensure the legal use of these streams, and we strongly recommend verifying that the content complies with the laws and regulations of your country before use.

