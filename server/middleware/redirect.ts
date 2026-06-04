export default defineEventHandler((event) => {
  const host = getRequestHost(event)
  const allowedHosts = ['localhost', 'fontutils.vhoyer.dev']

  if (!allowedHosts.some((h) => host === h || host.startsWith(`${h}:`))) {
    return sendRedirect(event, 'https://fontutils.vhoyer.dev', 301)
  }
})
