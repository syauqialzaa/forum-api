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
      id: userIdCredentials
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
  })

  describe('getRepliesByThreadId function', () => {
    it('should run function getRepliesByThreadId correctly and return expected properties', async () => {
      await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userIdCredentials
      })
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      const getReply = await replyRepositoryPostgres.getRepliesByThreadId(threadId)

      expect(getReply[0]).toHaveProperty('id')
      expect(getReply[0]).toHaveProperty('content')
      expect(getReply[0]).toHaveProperty('date')
      expect(getReply[0]).toHaveProperty('username')
      expect(getReply[0]).toHaveProperty('commentId')
      expect(getReply[0]).toHaveProperty('isDeleted')
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
