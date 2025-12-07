export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response('OK from worker', { status: 200 });
  },
};
