const DetailThread = require('../../../domains/threads/entities/detail-thread')
const DetailComment = require('../../../domains/comments/entities/detail-comment')
const DetailReply = require('../../../domains/replies/entities/detail-reply')
const ThreadRepository = require('../../../domains/threads/thread-repository')
const CommentRepository = require('../../../domains/comments/comment-repository')
const ReplyReposiotry = require('../../../domains/replies/reply-repository')
const GetDetailThreadUseCase = require('../get-detail-thread-use-case')
const LikeRepository = require('../../../domains/likes/like-repository')

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
      isDeleted: false,
      likeCount: 1
    },
    {
      id: 'comment-456',
      username: 'satyanadella',
      date: '2024-04-30T17:51:55.432Z555Z',
      content: 'this is second comment.',
      isDeleted: true,
      likeCount: 1
    }
  ]
  const updateCommentsAfterDeleted = [
    {
      id: comments[0].id,
      username: comments[0].username,
      date: comments[0].date,
      content: comments[0].content,
      likeCount: comments[0].likeCount
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedMark,
      likeCount: comments[0].likeCount
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
      ],
      likeCount: comments[0].likeCount
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedMark,
      replies: [],
      likeCount: comments[1].likeCount
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
          ],
          likeCount: comments[0].likeCount
        }),
        new DetailComment({
          id: comments[1].id,
          username: comments[1].username,
          date: comments[1].date,
          content: commentDeletedMark,
          replies: [],
          likeCount: comments[1].likeCount
        })
      ]
    })

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyReposiotry()
    const mockLikeRepository = new LikeRepository()

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve({ id: 'thread-123' }))
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread))
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(comments))
    mockLikeRepository.getLikeCountByCommentId = jest.fn(() => Promise.resolve(1))
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(replies))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository
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
  })
})
