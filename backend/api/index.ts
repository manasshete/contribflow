let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const mod = await import('../src/index');
      return mod.default || mod;
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel function initialization error:', err);
    return res.status(500).json({
      error: 'Initialization error',
      message: err?.message,
      stack: err?.stack,
    });
  }
}
