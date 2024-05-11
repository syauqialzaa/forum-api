const LikeRepository = require('../like-repository')

describe('LikeRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const likeRepository = new LikeRepository()

    await expect(likeRepository.checkCommentIsLiked({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.likeAComment({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.unlikeAComment({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.getLikeCountByCommentId({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
