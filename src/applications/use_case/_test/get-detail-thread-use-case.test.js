const DetailThread = require('../../../domains/threads/entities/detail-thread')
const DetailComment = require('../../../domains/comments/entities/detail-comment')
const DetailReply = require('../../../domains/replies/entities/detail-reply')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ReplyReposiotry = require('../../../domains/replies/reply-repository')
const GetDetailThreadUseCase = require('../get-detail-thread-use-case')

describe('GetDetailThreadUseCase', () => {
  const commentDeletedMark = '**komentar telah dihapus**'
  const replyDeletedMark = '**balasan telah dihapus**'

  const useCasePayload = {
    id: 'thread-123'
  }
  const thread = {
    id: useCasePayload.id,
    title: 'this is title.',
    body: 'this is body.',
    date: '2024-04-30T17:48:29.962Z',
    username: 'elonmusk'
  }
  const comments = [
    {
      id: 'comment-123',
      username: 'alzasyauqi',
      date: '2024-04-30T17:49:34.191Z',
      content: 'this is first comment.',
      isDeleted: false
    },
    {
      id: 'comment-456',
      username: 'satyanadella',
      date: '2024-04-30T17:51:55.432Z555Z',
      content: 'this is second comment.',
      isDeleted: true
    }
  ]
  const updateCommentsAfterDeleted = [
    {
      id: comments[0].id,
      username: comments[0].username,
      date: comments[0].date,
      content: comments[0].content
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedMark
    }
  ]
  const replies = [
    {
      id: 'reply-123',
      username: 'alzasyauqi',
      date: '2024-04-30T17:55:20.775Z',
      content: 'this is first reply.',
      commentId: 'comment-123',
      isDeleted: false
    },
    {
      id: 'reply-456',
      username: 'satyanadella',
      date: '2024-04-30T17:57:09.322Z',
      content: 'this is second reply.',
      commentId: 'comment-123',
      isDeleted: true
    }
  ]
  const updateRepliesAfterDeleted = [
    {
      id: comments[0].id,
      username: comments[0].username,
      date: comments[0].date,
      content: comments[0].content,
      replies: [
        {
          id: replies[0].id,
          username: replies[0].username,
          date: replies[0].date,
          content: replies[0].content
        },
        {
          id: replies[1].id,
          username: replies[1].username,
          date: replies[1].date,
          content: replyDeletedMark
        }
      ]
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedMark,
      replies: []
    }
  ]

  it('should orchestrating the get detail thread action correctly', async () => {
    const expectedDetailThread = new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: [
        new DetailComment({
          id: comments[0].id,
          username: comments[0].username,
          date: comments[0].date,
          content: comments[0].content,
          replies: [
            new DetailReply({
              id: replies[0].id,
              username: replies[0].username,
              date: replies[0].date,
              content: replies[0].content
            }),
            new DetailReply({
              id: replies[1].id,
              username: replies[1].username,
              date: replies[1].date,
              content: replyDeletedMark
            })
          ]
        }),
        new DetailComment({
          id: comments[1].id,
          username: comments[1].username,
          date: comments[1].date,
          content: commentDeletedMark,
          replies: []
        })
      ]
    })

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyReposiotry()

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }))
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread))
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments))
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(replies))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    getDetailThreadUseCase._updateCommentsAfterDeleted = jest.fn()
      .mockImplementation(() => [
        { ...updateCommentsAfterDeleted[0] },
        { ...updateCommentsAfterDeleted[1] }
      ])
    getDetailThreadUseCase._updateRepliesAfterDeleted = jest.fn()
      .mockImplementation(() => [
        { ...updateRepliesAfterDeleted[0] },
        { ...updateRepliesAfterDeleted[1] }
      ])

    const detailThread = await getDetailThreadUseCase.execute(useCasePayload)

    expect(detailThread).toEqual(expectedDetailThread)
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.id)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.id)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.id)
    expect(getDetailThreadUseCase._updateCommentsAfterDeleted).toBeCalledWith(comments)
    expect(getDetailThreadUseCase._updateRepliesAfterDeleted).toBeCalledWith(comments, replies)
  })

  it('should run _updateCommentsAfterDeleted function correctly', () => {
    const getDetailThreadUseCase = new GetDetailThreadUseCase({}, {}, {})

    expect(getDetailThreadUseCase._updateCommentsAfterDeleted([])).toHaveLength(0)
    expect(getDetailThreadUseCase._updateCommentsAfterDeleted(comments)).toHaveLength(2)
  })

  it('should run _updateRepliesAfterDeleted function correctly', () => {
    const getDetailThreadUseCase = new GetDetailThreadUseCase({}, {}, {})

    expect(getDetailThreadUseCase._updateRepliesAfterDeleted(comments, [])[0].replies).toHaveLength(0)
    expect(getDetailThreadUseCase._updateRepliesAfterDeleted(comments, replies)[0].replies).toHaveLength(2)
  })
})
