class DeleteReplyUseCase {
  constructor ({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload, useCaseUserIdCredentials) {
    const { replyId, threadId, commentId } = useCasePayload

    await this._threadRepository.verifyAvailableThread(threadId)
    await this._commentRepository.verifyAvailableComment(commentId)
    await this._replyRepository.verifyAvailableReply(replyId)
    await this._replyRepository.verifyReplyOwner(replyId, useCaseUserIdCredentials)

    await this._replyRepository.deleteReply(replyId)
  }
}

module.exports = DeleteReplyUseCase
