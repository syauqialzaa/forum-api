const pool = require('../../database/postgres/pool')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const AddComment = require('../../../domains/comments/entities/add-comment')
const AddedComment = require('../../../domains/comments/entities/added-comment')
const CommentRepositoryPostgres = require('../comment-repository-postgres')
const AuthorizationError = require('../../../commons/exceptions/authorization-error')
const NotFoundError = require('../../../commons/exceptions/not-found-error')

describe('CommentRepositoryPostgres', () => {
  const userIdCredentials = 'user-123'
  const threadId = 'thread-123'

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userIdCredentials
    })
    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userIdCredentials
    })
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      const addComment = new AddComment({
        content: 'this is a comment.',
        thread: threadId,
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      await commentRepositoryPostgres.addComment(addComment)

      const comments = await CommentsTableTestHelper.findCommentsById('comment-123')
      expect(comments).toHaveLength(1)
    })

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        content: 'this is a comment.',
        thread: threadId,
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      const addedComment = await commentRepositoryPostgres.addComment(addComment)

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'this is a comment.',
          owner: userIdCredentials
        })
      )
    })
  })

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment does not belong to owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      return expect(commentRepositoryPostgres.verifyCommentOwner('comment-000', userIdCredentials)).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when comment does belong to owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })

      await expect(commentRepositoryPostgres.verifyCommentOwner(comment.id, userIdCredentials)).resolves.not.toThrowError(AuthorizationError)
    })

    it('should return commentId when comment owner is verified', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })

      const verifyCommentOwner = await commentRepositoryPostgres.verifyCommentOwner(comment.id, userIdCredentials)

      expect(verifyCommentOwner).toStrictEqual({ id: comment.id })
    })
  })

  describe('verifyAvailableComment function', () => {
    it('should throw NotFoundError when comment is not exists', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      return expect(commentRepositoryPostgres.verifyAvailableComment('comment-000')).rejects.toThrowError(NotFoundError)
    })

    it('should throw NotFoundError when comment is exists but comment has been deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials,
        isDelete: true
      })

      return expect(commentRepositoryPostgres.verifyAvailableComment(comment.id)).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when comment is exists and not deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })

      return expect(commentRepositoryPostgres.verifyAvailableComment(comment.id)).resolves.not.toThrowError(NotFoundError)
    })

    it('should return id and isDeleted properties when comment availability is verified', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })

      const verifyAvailableComment = await commentRepositoryPostgres.verifyAvailableComment(comment.id)

      expect(verifyAvailableComment).toStrictEqual({ id: comment.id, isDeleted: false })
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should run function getCommentsByThreadId correctly and return empty comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const getCommentsByThreadId = await commentRepositoryPostgres.getCommentsByThreadId('undefined')

      expect(getCommentsByThreadId).toEqual([])
    })

    it('should run function getCommentsByThreadId correctly and return comments ', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-111',
        thread: threadId,
        owner: userIdCredentials
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        thread: threadId,
        owner: userIdCredentials
      })

      const getCommentsByThreadId = await commentRepositoryPostgres.getCommentsByThreadId(threadId)

      expect(getCommentsByThreadId).toHaveLength(3)
      getCommentsByThreadId.forEach(comment => {
        expect(comment).toHaveProperty('id')
        expect(comment).toHaveProperty('username')
        expect(comment).toHaveProperty('date')
        expect(comment).toHaveProperty('content')
        expect(comment).toHaveProperty('isDeleted')
        expect(comment).toEqual(expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          date: expect.any(Date),
          content: expect.any(String),
          isDeleted: expect.any(Boolean)
        }))
      })
    })
  })

  describe('deleteComment function', () => {
    it('should run function deleteComment correctly then return id and delete status', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userIdCredentials
      })

      const result = await commentRepositoryPostgres.deleteComment(comment.id)

      expect(result.isDeleted).toEqual(true)
      expect(result.id).toEqual(comment.id)
    })
  })
})
