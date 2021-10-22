import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  // We want the 'content-type' header to be present to be able to determine
  // the type of data sent by the client. So we respond to the client with
  // "Bad Request" status if the header is not available on the request.
  if (!request.headers.has("content-type")) {
    return new Response(
      JSON.stringify({ error: "please provide 'content-type' header" }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  const contentType = request.headers.get("content-type");
  const responseInit = {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };

  // Handle JSON data.
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return new Response(JSON.stringify({ json }, null, 2), responseInit);
  }

  // Handle form data.
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const formDataJSON = {};
    for (const [key, value] of formData.entries()) {
      formDataJSON[key] = value;
    }
    return new Response(
      JSON.stringify({ form: formDataJSON }, null, 2),
      responseInit,
    );
  }

  // Handle plain text.
  if (contentType.includes("text/plain")) {
    const text = await request.text();
    return new Response(JSON.stringify({ text }, null, 2), responseInit);
  }

  // Reaching here implies that we don't support the provided content-type
  // of the request so we reflect that back to the client.
  return new Response(null, {
    status: 415,
    statusText: "Unsupported Media Type",
  });
}

console.log("Listening on http://localhost:8080");
await listenAndServe(":8080", handleRequest);