export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // URL থেকে file id সংগ্রহ করা (?id=YOUR_FILE_ID)
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return new Response("Error: Please provide a Google Drive File ID (?id=FILE_ID)", {
        status: 400,
        headers: { "content-type": "text/plain" }
      });
    }

    // Google Drive সরাসরি ডাউনলোড লিঙ্ক
    const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;

    // অরিজিনাল রিকোয়েস্টের রেঞ্জ এবং হেডারের কপি তৈরি
    const headers = new Headers();
    if (request.headers.has("range")) {
      headers.set("range", request.headers.get("range"));
    }
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    // Google ড্রাইভ থেকে ফেচ করা
    const response = await fetch(driveUrl, {
      method: "GET",
      headers: headers,
    });

    // রেসপন্স হেডার সেট করা (CORS ও স্ট্রিমিং সাপোর্ট)
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
    newHeaders.set("Content-Disposition", "inline"); // ব্রাউজারে সরাসরি প্লে করার জন্য

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
};
