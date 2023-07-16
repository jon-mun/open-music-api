const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  #pool;

  #playlistSongActivitiesService;

  constructor(playlistSongActivitiesService) {
    this.#pool = new Pool();
    this.#playlistSongActivitiesService = playlistSongActivitiesService;
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Lagu gagal ditambahkan ke playlist');
    }

    await this.#playlistSongActivitiesService.addActivityToPlaylist(
      playlistId,
      songId,
      userId,
      'add',
      new Date().toISOString(),
    );

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer 
      FROM songs 
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id 
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.#pool.query(query);

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        'Gagal menghapus lagu dari playlist. Id lagu tidak ditemukan',
      );
    }

    await this.#playlistSongActivitiesService.addActivityToPlaylist(
      playlistId,
      songId,
      userId,
      'delete',
      new Date().toISOString(),
    );
  }

  async verifySongInPlaylist(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist');
    }
  }
}

module.exports = PlaylistSongsService;
