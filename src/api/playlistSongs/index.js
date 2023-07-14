const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (
    server,
    { playlistsService, songsService, service, validator },
  ) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistsService,
      songsService,
      service,
      validator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
