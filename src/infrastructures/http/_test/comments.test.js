const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const AuthenticationsTableTestHelper = require('../../../../tests/authentications-table-test-helper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const container = require('../../container')
const createServer = require('../create-server')

describe('/comments endpoint', () => {
  let server
  let accessToken
  let threadPayload
  const user = {
    username: 'alzasyauqi',
    password: 'secret_password',
    fullname: 'Alza Syauqi'
  }
  const thread = {
    title: 'this is title.',
    body: 'this is body.'
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
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('when POST /comments', () => {
    it('should response 201 and persisted comments', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseComments.payload)
      expect(responseComments.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()
    })

    it('should response 401 when user does not login', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseComments.statusCode).toEqual(401)
    })

    it('should response 404 when comment add on not found thread', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${'threadPayload.id'}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseComments.payload)
      expect(responseComments.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('data thread tidak ditemukan')
    })

    it('should response 400 when request payload did not contain needed property', async () => {
      const requestPayload = {}

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseComments.payload)
      expect(responseComments.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: true
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseComments.payload)
      expect(responseComments.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai')
    })
  })

  describe('when DELETE /comments', () => {
    it('should response 200 and success', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const comment = JSON.parse(responseComments.payload).data.addedComment

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload)
      expect(responseDeleteComment.statusCode).toEqual(200)
      expect(deleteComment.status).toEqual('success')
    })

    it('should response 401 when user does not login', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const comment = JSON.parse(responseComments.payload).data.addedComment

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseDeleteComment.statusCode).toEqual(401)
    })

    it('should response 403 when comment does not belong to owner', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const comment = JSON.parse(responseComments.payload).data.addedComment

      const userDummy = {
        username: 'dummy',
        password: 'secret-123',
        fullname: 'user dummy'
      }
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userDummy
      })
      const authentications = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userDummy.username,
          password: userDummy.password
        }
      })
      const dummyAccessToken = JSON.parse(authentications.payload).data.accessToken

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${dummyAccessToken}`
        }
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload)
      expect(responseDeleteComment.statusCode).toEqual(403)
      expect(deleteComment.status).toEqual('fail')
      expect(deleteComment.message).toEqual('komentar ini bukan milik anda')
    })

    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const comment = JSON.parse(responseComments.payload).data.addedComment

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/threadId/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload)
      expect(responseDeleteComment.statusCode).toEqual(404)
      expect(deleteComment.status).toEqual('fail')
      expect(deleteComment.message).toEqual('data thread tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      const requestPayload = {
        content: 'this is a comment.'
      }

      await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/commentId`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload)
      expect(responseDeleteComment.statusCode).toEqual(404)
      expect(deleteComment.status).toEqual('fail')
      expect(deleteComment.message).toEqual('data komentar tidak ditemukan')
    })
  })
})
