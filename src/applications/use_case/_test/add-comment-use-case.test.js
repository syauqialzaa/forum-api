const AddComment = require('../../../domains/comments/entities/add-comment')
const AddedComment = require('../../../domains/comments/entities/added-comment')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const AddCommentUseCase = require('../add-comment-use-case')

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'this is a comment.'
    }
    const useCaseThreadId = 'thread-123'
    const useCaseUserIdCredentials = 'user-123'
    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCaseUserIdCredentials
    })

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }))
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new AddedComment({
          id: 'comment-123',
          content: useCasePayload.content,
          owner: useCaseUserIdCredentials
        })
      ))

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    const addComment = await addCommentUseCase.execute(useCasePayload, useCaseThreadId, useCaseUserIdCredentials)

    expect(addComment).toStrictEqual(expectedAddedComment)
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseThreadId)
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
        thread: useCaseThreadId,
        owner: useCaseUserIdCredentials
      })
    )
  })
})
