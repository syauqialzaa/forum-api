/* istanbul ignore file */
const pool = require('../src/infrastructures/database/postgres/pool')

const LikesTableTestHelper = {
  async likeAComment ({
    id = 'like-123',
    comment,
    owner
  }) {
    const query = {
      text: 'INSERT INTO likes(id, comment_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, comment, owner]
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async getLikes () {
    const query = {
      text: 'SELECT * FROM likes'
    }

    const result = await pool.query(query)
    return result.rows
  },

  async getLikedCommentByLikeId (id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable () {}
}

module.exports = LikesTableTestHelper
