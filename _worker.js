export default {
  async fetch(request) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return new Response("Error: Please provide a File ID (?id=FILE_ID)", { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const driveBase = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    // প্রথম রিকোয়েস্ট পাঠানো কনফার্মেশন টোকেন পাওয়ার জন্য
    let initialRes = await fetch(driveBase, {
      headers: { "User-Agent": userAgent }
    });

    let downloadUrl = driveBase;
    let cookieHeader = initialRes.headers.get("set-cookie") || "";

    // বড় ফাইলের ভাইরাস ওয়ার্নিং পেজ হ্যান্ডেল করা
    const text = await initialRes.clone().text();
    const confirmMatch = text.match(/confirm=([^&"'>\s]+)/);

    if (confirmMatch) {
      downloadUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
    }

    // মূল ভিডিও স্ট্রিম ফেচ করা
    const fetchHeaders = new Headers();
    if (request.headers.has("Range")) {
      fetchHeaders.set("Range", request.headers.get("Range"));
    }
    fetchHeaders.set("User-Agent", userAgent);
    if (cookieHeader) {
      fetchHeaders.set("Cookie", cookieHeader);
    }

    const streamRes = await fetch(downloadUrl, {
      headers: fetchHeaders
    });

    const responseHeaders = new Headers(streamRes.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set("Access-Control-Expose-Headers", "Content-Length, Content-Range");

    return new Response(streamRes.body, {
      status: streamRes.status,
      statusText: streamRes.statusText,
      headers: responseHeaders
    });
  }
};
