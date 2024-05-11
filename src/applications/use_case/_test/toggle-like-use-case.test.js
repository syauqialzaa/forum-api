const ToggleLike = require('../../../domains/likes/entities/toggle-like')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const LikeRepository = require('../../../domains/likes/like-repository')
const ToggleLikeUseCase = require('../toggle-like-use-case')

describe('ToggleLikeUseCase', () => {
  it('should orchestrating the comment unliked action correctly', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123'
    }
    const useCaseUserIdCredentials = 'user-123'

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockLikeRepository = new LikeRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve({ id: 'thread-123' }))
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve({ id: 'comment-123', isDeleted: false }))
    mockLikeRepository.checkCommentIsLiked = jest.fn(() => Promise.resolve(true))
    mockLikeRepository.unlikeAComment = jest.fn()
    mockLikeRepository.likeAComment = jest.fn()

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    await toggleLikeUseCase.execute(useCaseParams, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParams.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCaseParams.commentId)
    expect(mockLikeRepository.checkCommentIsLiked).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials
    }))
    expect(mockLikeRepository.unlikeAComment).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials
    }))
  })

  it('should orchestrating the comment liked action correctly', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123'
    }
    const useCaseUserIdCredentials = 'user-123'

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockLikeRepository = new LikeRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve({ id: 'thread-123' }))
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve({ id: 'comment-123', isDeleted: false }))
    mockLikeRepository.checkCommentIsLiked = jest.fn(() => Promise.resolve(false))
    mockLikeRepository.unlikeAComment = jest.fn()
    mockLikeRepository.likeAComment = jest.fn()

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    await toggleLikeUseCase.execute(useCaseParams, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParams.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCaseParams.commentId)
    expect(mockLikeRepository.checkCommentIsLiked).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials
    }))
    expect(mockLikeRepository.likeAComment).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials
    }))
  })
})
