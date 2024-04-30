const AddReply = require('../../domains/replies/entities/add-reply')

class AddReplyUseCase {
  constructor ({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload, useCaseParams, useCaseUserIdCredentials) {
    const { content } = useCasePayload
    const { commentId, threadId } = useCaseParams

    await this._threadRepository.verifyAvailableThread(threadId)
    await this._commentRepository.verifyAvailableComment(commentId)

    const addReply = new AddReply({
      content,
      commentId,
      ownerId: useCaseUserIdCredentials
    })

    return this._replyRepository.addReply(addReply)
  }
}

module.exports = AddReplyUseCase
