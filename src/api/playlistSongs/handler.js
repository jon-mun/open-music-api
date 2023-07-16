class PlaylistSongsHandler {
  #playlistsService;

  #songsService;

  #service;

  #validator;

  constructor(playlistsService, songsService, service, validator) {
    this.#playlistsService = playlistsService;
    this.#songsService = songsService;
    this.#service = service;
    this.#validator = validator;

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsInPlaylistHandler = this.getSongsInPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler =
      this.deleteSongFromPlaylistHandler.bind(this);
  }

  async postSongToPlaylistHandler(request, h) {
    this.#validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#songsService.verifySongById(songId);
    await this.#playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.#service.addSongToPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);

    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this.#playlistsService.getPlaylistById(playlistId);
    const songs = await this.#service.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this.#validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#songsService.verifySongById(songId);
    await this.#playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this.#service.verifySongInPlaylist(playlistId, songId);
    await this.#service.deleteSongFromPlaylist(
      playlistId,
      songId,
      credentialId,
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
