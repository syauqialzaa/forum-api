class AddComment {
  constructor (payload) {
    this._verifyPayload(payload)
    const { content, threadId, ownerId } = payload

    this.content = content
    this.threadId = threadId
    this.ownerId = ownerId
  }

  _verifyPayload ({ content, threadId, ownerId }) {
    if (!content || !threadId || !ownerId) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddComment
