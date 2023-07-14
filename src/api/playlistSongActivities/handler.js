class PlaylistSongActivitiesHandler {
  #playlistSongActivitiesService;

  #playlistsService;

  constructor(playlistSongActivitiesService, playlistsService) {
    this.playlistsService = playlistsService;
    this.playlistSongActivitiesService = playlistSongActivitiesService;

    this.getPlaylistSongActivitiesHandler =
      this.getPlaylistSongActivitiesHandler.bind(this);
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const playlist = await this.playlistsService.getPlaylistById(playlistId);

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities =
      await this.playlistSongActivitiesService.getActivitiesByPlaylistId(
        playlistId,
      );

    return {
      status: 'success',
      data: {
        playlistId: playlist.id,
        activities,
      },
    };
  }
}

module.exports = PlaylistSongActivitiesHandler;
