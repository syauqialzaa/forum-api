class DeleteCommentUseCase {
  constructor ({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload, useCaseUserIdCredentials) {
    const { id, thread } = useCasePayload

    await this._threadRepository.verifyAvailableThread(thread)
    await this._commentRepository.verifyAvailableComment(id)
    await this._commentRepository.verifyCommentOwner(id, useCaseUserIdCredentials)

    await this._commentRepository.deleteComment(id)
  }
}

module.exports = DeleteCommentUseCase
