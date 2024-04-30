const AddComment = require('../../domains/comments/entities/add-comment')

class AddCommentUseCase {
  constructor ({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload, useCaseThreadId, useCaseUserIdCredentials) {
    const { content } = useCasePayload
    await this._threadRepository.verifyAvailableThread(useCaseThreadId)

    const addComment = new AddComment({
      content,
      threadId: useCaseThreadId,
      ownerId: useCaseUserIdCredentials
    })

    return this._commentRepository.addComment(addComment)
  }
}

module.exports = AddCommentUseCase
