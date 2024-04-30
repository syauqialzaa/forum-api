const ReplyRepository = require('../../../domains/replies/reply-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const DeleteReplyUseCase = require('../delete-reply-use-case')

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      id: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123'
    }
    const useCaseUserIdCredentials = 'user-123'

    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve())
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve())
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve())
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve())

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    await deleteReplyUseCase.execute(useCasePayload, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockReplyRepository.verifyAvailableReply).toBeCalledWith(useCasePayload.id)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.id, useCaseUserIdCredentials)
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.id)
  })
})
