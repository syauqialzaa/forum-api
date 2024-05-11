const LikeRepository = require('../../domains/likes/like-repository')

class LikeRepositoryPostgres extends LikeRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async checkCommentIsLiked (like) {
    const { comment, owner } = like

    const query = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [comment, owner]
    }

    const result = await this._pool.query(query)
    return !!result.rowCount
  }

  async likeAComment (like) {
    const { comment, owner } = like
    const id = `like-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO likes(id, comment_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, comment, owner]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async unlikeAComment (like) {
    const { comment, owner } = like

    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [comment, owner]
    }

    await this._pool.query(query)
  }

  async getLikeCountByCommentId (commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId]
    }

    const result = await this._pool.query(query)
    return Number(result.rows[0].count)
  }
}

module.exports = LikeRepositoryPostgres
