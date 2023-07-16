const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class PlaylistSongActivitiesService {
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  async addActivityToPlaylist(playlistId, songId, userId, action, time) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new Error('Activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
      FROM playlist_song_activities 
      INNER JOIN users ON users.id = playlist_song_activities.user_id 
      INNER JOIN songs ON songs.id = playlist_song_activities.song_id 
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.#pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
