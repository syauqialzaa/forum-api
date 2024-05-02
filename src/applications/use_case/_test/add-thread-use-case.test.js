const AddThread = require('../../../domains/threads/entities/add-thread')
const AddedThread = require('../../../domains/threads/entities/added-thread')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const AddThreadUseCase = require('../add-thread-use-case')

describe('', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'this is title.',
      body: 'this is body.'
    }
    const useCaseUserIdCredentials = 'user-123'
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'this is title.',
      owner: useCaseUserIdCredentials
    })

    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new AddedThread({
          id: 'thread-123',
          title: 'this is title.',
          owner: useCaseUserIdCredentials
        })
      ))

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    })

    const addThread = await addThreadUseCase.execute(useCasePayload, useCaseUserIdCredentials)

    expect(addThread).toStrictEqual(expectedAddedThread)
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCaseUserIdCredentials
      })
    )
  })
})
