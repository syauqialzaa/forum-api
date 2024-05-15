class GetDetailThreadUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
    this._likeRepository = likeRepository
  }

  async execute (useCasePayload) {
    const { id } = useCasePayload

    await this._threadRepository.verifyAvailableThread(id)
    const thread = await this._threadRepository.getThreadById(id)
    const comments = await this._commentRepository.getCommentsByThreadId(id)
    const replies = await this._replyRepository.getRepliesByThreadId(id)

    thread.comments = await Promise.all(comments.map(async comment => {
      comment.likeCount = await this._likeRepository.getLikeCountByCommentId(comment.id)
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content
      delete comment.isDeleted
      return comment
    }))

    thread.comments = comments.map(comment => {
      const filteredReplies = replies.filter(reply => reply.commentId === comment.id)
      filteredReplies.forEach(reply => {
        reply.content = reply.isDeleted ? '**balasan telah dihapus**' : reply.content
        delete reply.commentId
        delete reply.isDeleted
      })
      comment.replies = filteredReplies
      return comment
    })

    return thread
  }
}

module.exports = GetDetailThreadUseCase
