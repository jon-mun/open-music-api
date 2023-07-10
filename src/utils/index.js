/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */

const mapAlbumDBToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel };
