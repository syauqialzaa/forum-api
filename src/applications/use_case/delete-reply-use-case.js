class DeleteReplyUseCase {
  constructor ({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload, useCaseUserIdCredentials) {
    const { id, threadId, commentId } = useCasePayload

    await this._threadRepository.verifyAvailableThread(threadId)
    await this._commentRepository.verifyAvailableComment(commentId)
    await this._replyRepository.verifyAvailableReply(id)
    await this._replyRepository.verifyReplyOwner(id, useCaseUserIdCredentials)

    await this._replyRepository.deleteReply(id)
  }
}

module.exports = DeleteReplyUseCase
