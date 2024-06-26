const ReplyRepository = require('../../domains/replies/reply-repository')
const AddedReply = require('../../domains/replies/entities/added-reply')
const AuthorizationError = require('../../commons/exceptions/authorization-error')
const NotFoundError = require('../../commons/exceptions/not-found-error')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addReply (reply) {
    const { content, comment, owner } = reply
    const id = `reply-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, user_id AS owner',
      values: [id, content, comment, owner]
    }

    const result = await this._pool.query(query)

    return new AddedReply({ ...result.rows[0] })
  }

  async verifyReplyOwner (id, userId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND user_id = $2',
      values: [id, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('balasan ini bukan milik anda')
    }

    return result.rows[0]
  }

  async verifyAvailableReply (id) {
    const query = {
      text: 'SELECT id, is_delete AS "isDeleted" FROM replies WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount || result.rows[0].isDeleted) {
      throw new NotFoundError('data balasan tidak ditemukan')
    }

    return result.rows[0]
  }

  async getRepliesByThreadId (threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, username, replies.comment_id AS "commentId", replies.is_delete AS "isDeleted"
              FROM replies
              JOIN users ON replies.user_id = users.id
              JOIN comments ON replies.comment_id = comments.id
              JOIN threads ON threads.id = comments.thread_id
              WHERE threads.id = $1
              ORDER BY replies.date`,
      values: [threadId]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async deleteReply (id) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2 RETURNING id, is_delete AS "isDeleted"',
      values: [true, id]
    }

    const result = await this._pool.query(query)

    return result.rows[0]
  }
}

module.exports = ReplyRepositoryPostgres
