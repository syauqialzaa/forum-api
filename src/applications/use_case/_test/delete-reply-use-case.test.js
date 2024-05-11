const ReplyRepository = require('../../../domains/replies/reply-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const DeleteReplyUseCase = require('../delete-reply-use-case')

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123'
    }
    const useCaseUserIdCredentials = 'user-123'

    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve({ id: 'thread-123' }))
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve({ id: 'comment-123', isDeleted: false }))
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve({ id: 'reply-123', isDeleted: false }))
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve({ id: 'reply-123' }))
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve({ id: 'reply-123', isDeleted: true }))

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    await deleteReplyUseCase.execute(useCasePayload, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockReplyRepository.verifyAvailableReply).toBeCalledWith(useCasePayload.replyId)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCaseUserIdCredentials)
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId)
  })
})
