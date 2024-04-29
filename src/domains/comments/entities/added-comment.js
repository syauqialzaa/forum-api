class AddedComment {
  constructor (payload) {
    this._verifyPayload(payload)
    const { id, content, ownerId } = payload

    this.id = id
    this.content = content
    this.ownerId = ownerId
  }

  _verifyPayload ({ id, content, ownerId }) {
    if (!id || !content || !ownerId) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddedComment
