class AddReply {
  constructor (payload) {
    this._verifyPayload(payload)
    const { content, commentId, ownerId } = payload

    this.content = content
    this.commentId = commentId
    this.ownerId = ownerId
  }

  _verifyPayload ({ content, commentId, ownerId }) {
    if (!content || !commentId || !ownerId) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string' || typeof commentId !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddReply
