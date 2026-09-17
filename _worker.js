export default {
  async fetch(request) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return new Response("Error: Missing file ID", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        "Range": request.headers.get("Range") || "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // গুগলের সব পুরোনো হেডার সরিয়ে নতুন হেডার তৈরি
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "*");
    headers.set("Content-Type", "video/mp4");
    headers.set("Content-Disposition", "inline");
    headers.set("Accept-Ranges", "bytes");

    if (driveRes.headers.has("Content-Range")) {
      headers.set("Content-Range", driveRes.headers.get("Content-Range"));
    }
    if (driveRes.headers.has("Content-Length")) {
      headers.set("Content-Length", driveRes.headers.get("Content-Length"));
    }

    return new Response(driveRes.body, {
      status: driveRes.status,
      statusText: driveRes.statusText,
      headers: headers
    });
  }
};
