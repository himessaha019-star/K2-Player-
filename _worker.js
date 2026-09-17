export default {
  async fetch(request) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return new Response("Error: Please provide a File ID", { status: 400 });
    }

    // confirm=t is used to bypass the Google Drive virus scan warning for large files
    const driveUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;

    const response = await fetch(driveUrl, {
      headers: {
        "Range": request.headers.get("Range") || "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Headers", "*");
    return newResponse;
  }
};
