const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const AuthenticationsTableTestHelper = require('../../../../tests/authentications-table-test-helper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const LikesTableTestHelper = require('../../../../tests/likes-table-test-helper')
const container = require('../../container')
const createServer = require('../create-server')

describe('/likes endpoint', () => {
  let server
  let accessToken
  let threadPayload
  let commentPayload
  const user = {
    username: 'alzasyauqi',
    password: 'secret_password',
    fullname: 'Alza Syauqi'
  }
  const thread = {
    title: 'this is title.',
    body: 'this is body.'
  }
  const comment = {
    content: 'this is a comment.'
  }

  beforeEach(async () => {
    server = await createServer(container)

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: user
    })

    const authentications = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: user.username,
        password: user.password
      }
    })
    accessToken = JSON.parse(authentications.payload).data.accessToken

    const threads = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: thread,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    threadPayload = JSON.parse(threads.payload).data.addedThread

    const comments = await server.inject({
      method: 'POST',
      url: `/threads/${threadPayload.id}/comments`,
      payload: comment,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    commentPayload = JSON.parse(comments.payload).data.addedComment
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await LikesTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('when /PUT likes', () => {
    it('should response 200 and comment liked', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const putLikes = JSON.parse(responseLikes.payload)
      const allLikes = await LikesTableTestHelper.getLikes()

      expect(responseLikes.statusCode).toEqual(200)
      expect(putLikes.status).toEqual('success')
      expect(allLikes).toHaveLength(1)
    })

    it('should response 200 and comment unliked', async () => {
      const userId = await UsersTableTestHelper.findUsersByUsername(user.username)
      await LikesTableTestHelper.likeAComment({
        comment: commentPayload.id,
        owner: userId.id
      })
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const putLikes = JSON.parse(responseLikes.payload)
      const allLikes = await LikesTableTestHelper.getAllLikes()

      expect(responseLikes.statusCode).toEqual(200)
      expect(putLikes.status).toEqual('success')
      expect(allLikes).toHaveLength(0)
    })

    it('should response 401 when user does not login', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseLikes.statusCode).toEqual(401)
    })

    it('should response 404 when thread not found', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${'threadPayload.id'}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const putLikes = JSON.parse(responseLikes.payload)
      expect(responseLikes.statusCode).toEqual(404)
      expect(putLikes.status).toEqual('fail')
      expect(putLikes.message).toEqual('data thread tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${'commentPayload.id'}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const putLikes = JSON.parse(responseLikes.payload)
      expect(responseLikes.statusCode).toEqual(404)
      expect(putLikes.status).toEqual('fail')
      expect(putLikes.message).toEqual('data komentar tidak ditemukan')
    })
  })
})
