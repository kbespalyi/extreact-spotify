export default function() {

  const token = window.location.hash.substr(1);

  if (token) {
    const o = Object.fromEntries(new URLSearchParams(token));

    Ext.Ajax.on('beforerequest', (connection, options) => {
      Object.assign(options, {
        headers: {
          Authorization: `Bearer ${o.access_token}`
        },
        useDefaultXhrHeader: false
      })
    })

    Ext.Ajax.on('requestexception', (connection, options) => redirectToSpotifyAuthentication())

    return o.access_token;
  } else {
    // If there is no token, redirect to Spotify authorization
    redirectToSpotifyAuthentication();
  }
}

function redirectToSpotifyAuthentication() {
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = 'ba51b0e1a6e3482789ba106c2daebfc3';
  const redirectUri = `${window.location.protocol}//${window.location.host}/`;
  const query = `client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&show_dialog=true`;
  window.location = `${authEndpoint}?${query}`;
}
