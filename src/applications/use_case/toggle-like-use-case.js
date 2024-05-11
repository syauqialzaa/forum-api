const ToggleLike = require('../../domains/likes/entities/toggle-like')

class ToggleLikeUseCase {
  constructor ({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCaseParams, useCaseUserIdCredentials) {
    const { threadId, commentId } = useCaseParams

    await this._threadRepository.verifyAvailableThread(threadId)
    await this._commentRepository.verifyAvailableComment(commentId)

    const toggleLike = new ToggleLike({
      comment: commentId,
      owner: useCaseUserIdCredentials
    })

    const isLiked = await this._likeRepository.checkCommentIsLiked(toggleLike)
    if (isLiked) {
      await this._likeRepository.unlikeAComment(toggleLike)
    } else {
      await this._likeRepository.likeAComment(toggleLike)
    }
  }
}

module.exports = ToggleLikeUseCase
