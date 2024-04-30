class GetDetailThreadUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
  }

  async execute (useCasePayload) {
    const { id } = useCasePayload

    await this._threadRepository.verifyAvailableThread(id)
    const thread = await this._threadRepository.getThreadById(id)
    const comments = await this._commentRepository.getCommentsByThreadId(id)
    thread.comments = this._updateCommentsAfterDeleted(comments)
    const replies = await this._replyRepository.getRepliesByThreadId(id)
    thread.comments = this._updateRepliesAfterDeleted(comments, replies)

    return thread
  }

  _updateCommentsAfterDeleted (comments) {
    const commentDeletedMark = '**komentar telah dihapus**'

    comments.forEach(comment => {
      comment.content = comment.isDeleted
        ? commentDeletedMark
        : comment.content
      delete comment.isDeleted
    })

    return comments
  }

  _updateRepliesAfterDeleted (comments, replies) {
    const replyDeletedMark = '**balasan telah dihapus**'

    for (let index = 0; index < comments.length; index++) {
      const filteredReplies = replies.filter(
        reply => reply.commentId === comments[index].id
      )

      filteredReplies.forEach(reply => {
        reply.content = reply.isDeleted
          ? replyDeletedMark
          : reply.content
        delete reply.commentId
        delete reply.isDeleted
      })

      comments[index].replies = filteredReplies
    }

    return comments
  }
}

module.exports = GetDetailThreadUseCase
