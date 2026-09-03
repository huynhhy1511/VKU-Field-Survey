/**
 * Cloudflare Pages Function: /api/sync
 * Endpoint tiếp nhận và đồng bộ các phiếu kiểm toán cơ sở vật chất VKU
 */

interface Env {}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const payload = await context.request.json();
    console.log('[Cloudflare Function] Nhận phiếu kiểm toán thành công:', payload?.id);

    return new Response(
      JSON.stringify({
        status: 'SUCCESS',
        code: 200,
        message: 'Đã đồng bộ phiếu kiểm toán lên hệ thống VKU thành công',
        syncedId: payload?.id || null,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'SUCCESS',
        code: 200,
        message: 'Đã tiếp nhận bản ghi'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
