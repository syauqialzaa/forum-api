const pool = require('../../database/postgres/pool')
const RepliesTableTestHelper = require('../../../../tests/replies-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const ThreadTableTestHelper = require('../../../../tests/threads-table-test-helper')
const UsersTableTeastHelper = require('../../../../tests/users-table-test-helper')
const AddReply = require('../../../domains/replies/entities/add-reply')
const AddedReply = require('../../../domains/replies/entities/added-reply')
const AuthorizationError = require('../../../commons/exceptions/authorization-error')
const NotFoundError = require('../../../commons/exceptions/not-found-error')
const ReplyRepositoryPostgres = require('../reply-repository-postgres')

describe('ReplyRepositoryPostgres', () => {
  const userIdCredentials = 'user-123'
  const threadId = 'thread-123'
  const commentId = 'comment-123'

  beforeEach(async () => {
    await UsersTableTeastHelper.addUser({
      id: userIdCredentials,
      username: 'alzasyauqi'
    })
    await ThreadTableTestHelper.addThread({
      id: threadId,
      owner: userIdCredentials
    })
    await CommentsTableTestHelper.addComment({
      id: commentId,
      thread: threadId,
      owner: userIdCredentials
    })
  })

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await UsersTableTeastHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      const addReply = new AddReply({
        content: 'this is a reply.',
        comment: commentId,
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      await replyRepositoryPostgres.addReply(addReply)

      const replies = await RepliesTableTestHelper.findRepliesById('reply-123')
      expect(replies).toHaveLength(1)
    })

    it('should return added reply correctly', async () => {
      const addReply = new AddReply({
        content: 'this is a reply.',
        comment: commentId,
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      const addedReply = await replyRepositoryPostgres.addReply(addReply)

      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'this is a reply.',
          owner: userIdCredentials
        })
      )
    })
  })

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply does not belong to owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      return expect(replyRepositoryPostgres.verifyReplyOwner('reply-000', userIdCredentials)).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when reply does belong to owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })

      await expect(replyRepositoryPostgres.verifyReplyOwner(reply.id, userIdCredentials)).resolves.not.toThrowError(AuthorizationError)
    })

    it('should return replyId when reply owner is verified', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })

      const verifyReplyOwner = await replyRepositoryPostgres.verifyReplyOwner(reply.id, userIdCredentials)

      expect(verifyReplyOwner).toStrictEqual({ id: reply.id })
    })
  })

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError when reply is not exists', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      return expect(replyRepositoryPostgres.verifyAvailableReply('reply-000')).rejects.toThrowError(NotFoundError)
    })

    it('should throw NotFoundError when reply is exists but reply has been deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials,
        isDelete: true
      })

      return expect(replyRepositoryPostgres.verifyAvailableReply(reply.id)).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when reply is exists and not deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })

      return expect(replyRepositoryPostgres.verifyAvailableReply(reply.id)).resolves.not.toThrowError(NotFoundError)
    })

    it('should return id and isDeleted properties when reply availability is verified', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })

      const verifyAvailableReply = await replyRepositoryPostgres.verifyAvailableReply(reply.id)

      expect(verifyAvailableReply).toStrictEqual({ id: reply.id, isDeleted: false })
    })
  })

  describe('getRepliesByThreadId function', () => {
    it('should run function getRepliesByThreadId correctly and return expected properties', async () => {
      const reply1 = {
        id: 'reply-111',
        content: 'this is a reply.',
        comment: commentId,
        owner: userIdCredentials
      }
      const reply2 = {
        id: 'reply-222',
        content: 'this is another reply.',
        comment: commentId,
        owner: userIdCredentials
      }
      await RepliesTableTestHelper.addReply({ ...reply1 })
      await RepliesTableTestHelper.addReply({ ...reply2 })
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      const getReplies = await replyRepositoryPostgres.getRepliesByThreadId(threadId)

      expect(getReplies).toHaveLength(2)
      expect(getReplies[0].id).toStrictEqual(reply1.id)
      expect(getReplies[0].content).toStrictEqual(reply1.content)
      expect(getReplies[0].date).toStrictEqual(expect.any(Date))
      expect(getReplies[0].username).toStrictEqual('alzasyauqi')
      expect(getReplies[0].commentId).toStrictEqual(reply1.comment)
      expect(getReplies[0].isDeleted).toStrictEqual(false)
      expect(getReplies[1].id).toStrictEqual(reply2.id)
      expect(getReplies[1].content).toStrictEqual(reply2.content)
      expect(getReplies[1].date).toStrictEqual(expect.any(Date))
      expect(getReplies[1].username).toStrictEqual('alzasyauqi')
      expect(getReplies[0].commentId).toStrictEqual(reply2.comment)
      expect(getReplies[1].isDeleted).toStrictEqual(false)
      getReplies.forEach(reply => {
        expect(reply).toHaveProperty('id')
        expect(reply).toHaveProperty('content')
        expect(reply).toHaveProperty('date')
        expect(reply).toHaveProperty('username')
        expect(reply).toHaveProperty('commentId')
        expect(reply).toHaveProperty('isDeleted')
      })
    })
  })

  describe('deleteReply function', () => {
    it('should run function deleteReply correctly then return id and delete status', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })

      const result = await replyRepositoryPostgres.deleteReply(reply.id)

      expect(result.isDeleted).toEqual(true)
      expect(result.id).toEqual(reply.id)
    })
  })
})
