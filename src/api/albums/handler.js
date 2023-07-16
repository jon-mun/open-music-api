/* eslint-disable no-unused-vars */
class AlbumsHandler {
  #service;

  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    // bind
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this.#validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this.#service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this.#service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    const album = await this.#service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    this.#validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    await this.#service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    await this.#service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
