const config = require('../../utils/config');

class UploadsHandler {
  #storageService;

  #albumsService;

  #validator;

  constructor(storageService, albumsService, validator) {
    this.#storageService = storageService;
    this.#albumsService = albumsService;
    this.#validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;

    const { cover: data } = request.payload;

    await this.#albumsService.verifyAlbumExists(id);

    this.#validator.validateImageHeaders(data.hapi.headers);

    const fileLocation = await this.#storageService.writeFile(data, data.hapi);

    const url = `http://${config.app.host}:${config.app.port}/upload/${fileLocation}`;

    // update cover_url di database
    await this.#albumsService.editAlbumCoverUrl(id, url);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
