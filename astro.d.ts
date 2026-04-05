declare module 'astro' {
  export type APIRoute = (context: {
    request: Request;
    url: URL;
  }) => Response | Promise<Response>;
}
