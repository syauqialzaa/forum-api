const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const LikesTableTestHelper = require('../../../../tests/likes-table-test-helper')
const ToggleLike = require('../../../domains/likes/entities/toggle-like')
const LikeRepositoryPostgres = require('../like-repository-postgres')

describe('LikeRepositoryPostgres', () => {
  const userIdCredentials = 'user-123'
  const threadId = 'thread-123'
  const commentId = 'comment-123'

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userIdCredentials,
      username: 'alzasyauqi'
    })
    await ThreadsTableTestHelper.addThread({
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
    await LikesTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('checkCommentIsLiked function', () => {
    it('should return true when comment is liked', async () => {
      await LikesTableTestHelper.likeAComment({
        comment: commentId,
        owner: userIdCredentials
      })
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})

      const like = await likeRepositoryPostgres.checkCommentIsLiked({
        comment: commentId,
        owner: userIdCredentials
      })

      expect(like).toStrictEqual(true)
    })

    it('should return false when comment is unliked', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})

      const like = await likeRepositoryPostgres.checkCommentIsLiked({
        comment: commentId,
        owner: userIdCredentials
      })

      expect(like).toStrictEqual(false)
    })
  })

  describe('likeAComment function', () => {
    it('should persist like a comment', async () => {
      const toggleLike = new ToggleLike({
        comment: commentId,
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator)

      const commentLiked = await likeRepositoryPostgres.likeAComment(toggleLike)

      expect(commentLiked).toHaveLength(1)
      expect(commentLiked[0].id).toEqual('like-123')
    })
  })

  describe('unlikeAComment function', () => {
    it('should persist unlike a comment', async () => {
      await LikesTableTestHelper.likeAComment({
        id: 'like-123',
        comment: commentId,
        owner: userIdCredentials
      })
      const toggleLike = new ToggleLike({
        comment: commentId,
        owner: userIdCredentials
      })
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})

      await likeRepositoryPostgres.unlikeAComment(toggleLike)

      const commentLiked = await LikesTableTestHelper.getLikedCommentByLikeId('like-123')
      expect(commentLiked).toHaveLength(0)
    })
  })

  describe('getLikeCountByCommentId function', () => {
    it('should run getLikeCountByCommentId correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-000', username: 'dummy1' })
      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'dummy2' })
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'dummy3' })
      await LikesTableTestHelper.likeAComment({ id: 'like-123', comment: commentId, owner: 'user-000' })
      await LikesTableTestHelper.likeAComment({ id: 'like-456', comment: commentId, owner: 'user-111' })
      await LikesTableTestHelper.likeAComment({ id: 'like-789', comment: commentId, owner: 'user-222' })
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})

      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId(commentId)

      expect(likeCount).toStrictEqual(3)
    })
  })
})
