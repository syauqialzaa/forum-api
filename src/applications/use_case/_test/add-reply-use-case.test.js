const AddReply = require('../../../domains/replies/entities/add-reply')
const AddedReply = require('../../../domains/replies/entities/added-reply')
const ReplyRepository = require('../../../domains/replies/reply-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const AddReplyUseCase = require('../add-reply-use-case')

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'this is a reply.'
    }
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123'
    }
    const useCaseUserIdCredentials = 'user-123'
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      ownerId: useCaseUserIdCredentials
    })

    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve())
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new AddedReply({
          id: 'reply-123',
          content: useCasePayload.content,
          ownerId: useCaseUserIdCredentials
        })
      ))

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    const addReply = await addReplyUseCase.execute(useCasePayload, useCaseParams, useCaseUserIdCredentials)

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParams.threadId)
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCaseParams.commentId)
    expect(addReply).toStrictEqual(expectedAddedReply)
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
        commentId: useCaseParams.commentId,
        ownerId: useCaseUserIdCredentials
      })
    )
  })
})