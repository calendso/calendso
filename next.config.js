const withTM = require('next-transpile-modules')(['react-timezone-select']);

const validJson = (jsonString) => {
    try {
        const o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) {}
    return false;
}

if (process.env.GOOGLE_API_CREDENTIALS && ! validJson(process.env.GOOGLE_API_CREDENTIALS)) {
    console.warn('\x1b[33mwarn', '\x1b[0m', "- Disabled 'Google Calendar' integration. Reason: Invalid value for GOOGLE_API_CREDENTIALS environment variable. When set, this value needs to contain valid JSON like {\"web\":{\"client_id\":\"<clid>\",\"client_secret\":\"<secret>\",\"redirect_uris\":[\"<yourhost>/api/integrations/googlecalendar/callback>\"]}. You can download this JSON from your OAuth Client @ https://console.cloud.google.com/apis/credentials.");
}

module.exports = withTM({
  future: {
    webpack5: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: process.env.BASE_PATH || '',
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/profile',
        permanent: true,
      }
    ]
  }
});
