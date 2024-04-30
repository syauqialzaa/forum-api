const CommentRepository = require('../../../domains/comments/comment-repository')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const DeleteCommentUseCase = require('../delete-comment-use-case')

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      id: 'comment-123',
      threadId: 'thread-123'
    }
    const useCaseUserIdCredentials = 'user-123'

    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve())
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    await deleteCommentUseCase.execute(useCasePayload, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.id)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.id, useCaseUserIdCredentials)
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.id)
  })
})
