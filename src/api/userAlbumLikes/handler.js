class UserAlbumLikesHandler {
  #userAlbumLikesService;

  #albumsService;

  constructor(userAlbumLikesService, albumsService) {
    this.#userAlbumLikesService = userAlbumLikesService;
    this.#albumsService = albumsService;

    this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
    this.getUserAlbumLikesHandler = this.getUserAlbumLikesHandler.bind(this);
    this.deleteUserAlbumLikeHandler =
      this.deleteUserAlbumLikeHandler.bind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this.#albumsService.verifyAlbumExists(albumId);
    await this.#userAlbumLikesService.verifyUniqueUserAlbumLike(
      credentialId,
      albumId,
    );

    await this.#userAlbumLikesService.addUserAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    await this.#albumsService.verifyAlbumExists(albumId);

    const data = await this.#userAlbumLikesService.getAlbumLikesByAlbumId(
      albumId,
    );

    const { likes, cache } = data;

    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likes),
      },
    });

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteUserAlbumLikeHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this.#albumsService.verifyAlbumExists(albumId);

    await this.#userAlbumLikesService.deleteUserAlbumLikeByAlbumIdAndUserId(
      albumId,
      credentialId,
    );

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }
}

module.exports = UserAlbumLikesHandler;
