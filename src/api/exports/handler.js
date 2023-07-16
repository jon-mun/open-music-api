class ExportsHandler {
  #producerService;

  #playlistsService;

  #validator;

  constructor(producerService, playlistsService, validator) {
    this.producerService = producerService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this.validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistExist(playlistId);
    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.producerService.sendMessage(
      'export:playlist',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
