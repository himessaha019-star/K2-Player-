export default {
  async fetch(request) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");
    const fileName = url.searchParams.get("name") || "Episode.mp4";

    if (!fileId) {
      return new Response("Error: Missing file ID (?id=FILE_ID)", { status: 400 });
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    // ফাইলটি প্লে না করিয়ে সরাসরি ডাউনলোড করানোর হেডার
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);

    return new Response(driveRes.body, {
      status: driveRes.status,
      statusText: driveRes.statusText,
      headers: headers
    });
  }
};
