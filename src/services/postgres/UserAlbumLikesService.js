const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  #pool;

  #cacheService;

  constructor(cacheService) {
    this.#pool = new Pool();

    this.#cacheService = cacheService;
  }

  async addUserAlbumLike(userId, albumId) {
    const id = `userAlbumLike-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('User album like gagal ditambahkan');
    }

    await this.#cacheService.delete(`userAlbumLikes:${albumId}`);
  }

  async getAlbumLikesByAlbumId(albumId) {
    try {
      const result = await this.#cacheService.get(`userAlbumLikes:${albumId}`);

      return { likes: JSON.parse(result), cache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.#pool.query(query);

      await this.#cacheService.set(
        `userAlbumLikes:${albumId}`,
        JSON.stringify(result.rows[0].count),
        60 * 30,
      );

      return { likes: Number(result.rows[0].count), cache: false };
    }
  }

  async deleteUserAlbumLikeByAlbumIdAndUserId(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus like. Like tidak ditemukan');
    }

    await this.#cacheService.delete(`userAlbumLikes:${albumId}`);
  }

  async verifyUniqueUserAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this.#pool.query(query);

    if (result.rows.length) {
      throw new InvariantError(
        'Gagal menambahkan like. User sudah memberikan like.',
      );
    }

    await this.#cacheService.delete(`userAlbumLikes:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
