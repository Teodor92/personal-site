// One measured result per post, quoted from the post's own text and shown on
// its card as proof. Only posts that report a measured outcome appear here;
// never add a figure the post doesn't state.
export const postResults: Record<string, { figure: string; label: string }> = {
  'rebuilding-my-site-with-an-ai-agent': {
    figure: '11MB → 5.9MB',
    label: 'build size after the rebuild',
  },
  'usenet-setup-2026-eastern-europe': {
    figure: '2,052',
    label: 'monitored items with no file before the move',
  },
  'hardening-my-homelab-mcp-setup': {
    figure: '~3s',
    label: 'to fail cleanly off the home network',
  },
};
