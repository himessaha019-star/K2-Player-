export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url") || url.searchParams.get("link");
    const driveId = url.searchParams.get("id");
    const fileName = url.searchParams.get("name") || "K2Box_Episode.mp4";

    // ১. গুগল ড্রাইভ হ্যান্ডলিং
    let gDriveId = driveId;
    if (!gDriveId && targetUrl && targetUrl.includes("drive.google.com")) {
      const match = targetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || targetUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match) gDriveId = match[1];
    }

    if (gDriveId) {
      const driveDownloadUrl = `https://drive.google.com/uc?export=download&id=${gDriveId}`;
      const driveRes = await fetch(driveDownloadUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Content-Type", "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${fileName}"`);

      return new Response(driveRes.body, {
        status: driveRes.status,
        statusText: driveRes.statusText,
        headers: headers
      });
    }

    if (!targetUrl) {
      return new Response("Error: Missing URL parameter (?url=YOUR_LINK)", { status: 400 });
    }

    // ২. Pixeldrain হ্যান্ডলিং (স্বয়ংক্রিয়ভাবে Direct API লিংকে রূপান্তর)
    if (targetUrl.includes("pixeldrain.com")) {
      const pdMatch = targetUrl.match(/pixeldrain\.com\/(?:u|api\/file)\/([a-zA-Z0-9]+)/);
      if (pdMatch) {
        const pdDirectUrl = `https://pixeldrain.com/api/file/${pdMatch[1]}?download`;
        return Response.redirect(pdDirectUrl, 302);
      }
    }

    // ৩. Mediafire হ্যান্ডলিং (ডিরেক্ট ডাউনলোড লিংক বের করা)
    if (targetUrl.includes("mediafire.com")) {
      try {
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        const html = await res.text();
        const match = html.match(/href="([^"]+)"\s+id="downloadButton"/) || 
                      html.match(/id="downloadButton"[^>]*href="([^"]+)"/) ||
                      html.match(/https:\/\/download\d+\.mediafire\.com\/[^\s"']+/);

        if (match) {
          const directLink = match[1] || match[0];
          return Response.redirect(directLink, 302);
        }
      } catch (err) {
        // কোনো কারণে স্ক্র্যাপ ফেইল করলে সাধারণ রিডাইরেক্ট
        return Response.redirect(targetUrl, 302);
      }
    }

    // ৪. অন্য যেকোনো সরাসরি ভিডিও লিংক হলে
    return Response.redirect(targetUrl, 302);
  }
};
