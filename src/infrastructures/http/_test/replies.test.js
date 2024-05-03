const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const AuthenticationsTableTestHelper = require('../../../../tests/authentications-table-test-helper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const RepliesTableTestHelper = require('../../../../tests/replies-table-test-helper')
const container = require('../../container')
const createServer = require('../create-server')

describe('/replies endpoint', () => {
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
    await RepliesTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('when /POST replies', () => {
    it('should response 201 and persisted replies', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseReplies.payload)
      expect(responseReplies.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply).toBeDefined()
    })

    it('should response 401 when user does not login', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseReplies.statusCode).toEqual(401)
    })

    it('should response 404 when reply add on not found thread', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${'threadPayload.id'}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseReplies.payload)
      expect(responseReplies.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('data thread tidak ditemukan')
    })

    it('should response 404 when reply add on not found comment', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${'commentPayload.id'}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseReplies.payload)
      expect(responseReplies.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('data komentar tidak ditemukan')
    })

    it('should response 400 when request payload did not contain needed property', async () => {
      const requestPayload = {}

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseReplies.payload)
      expect(responseReplies.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: true
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseReplies.payload)
      expect(responseReplies.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai')
    })
  })

  describe('when /DELETE replies', () => {
    it('should response 200 and success', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const reply = JSON.parse(responseReplies.payload).data.addedReply

      const responseDeleteReply = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteReply = JSON.parse(responseDeleteReply.payload)
      expect(responseDeleteReply.statusCode).toEqual(200)
      expect(deleteReply.status).toEqual('success')
    })

    it('should response 401 when user does not login', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const reply = JSON.parse(responseReplies.payload).data.addedReply

      const responseDeleteReplies = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseDeleteReplies.statusCode).toEqual(401)
    })

    it('should response 403 when reply does not belong to owner', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const reply = JSON.parse(responseReplies.payload).data.addedReply

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
      const dummyAccesstoken = JSON.parse(authentications.payload).data.accessToken

      const responseDeleteReplies = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${dummyAccesstoken}`
        }
      })

      const deleteReply = JSON.parse(responseDeleteReplies.payload)
      expect(responseDeleteReplies.statusCode).toEqual(403)
      expect(deleteReply.status).toEqual('fail')
      expect(deleteReply.message).toEqual('balasan ini bukan milik anda')
    })

    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const reply = JSON.parse(responseReplies.payload).data.addedReply

      const responseDeleteReplies = await server.inject({
        method: 'DELETE',
        url: `/threads/${'threadPayload.id'}/comments/${commentPayload.id}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteReply = JSON.parse(responseDeleteReplies.payload)
      expect(responseDeleteReplies.statusCode).toEqual(404)
      expect(deleteReply.status).toEqual('fail')
      expect(deleteReply.message).toEqual('data thread tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const reply = JSON.parse(responseReplies.payload).data.addedReply

      const responseDeleteReplies = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${'commentPayload.id'}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteReply = JSON.parse(responseDeleteReplies.payload)
      expect(responseDeleteReplies.statusCode).toEqual(404)
      expect(deleteReply.status).toEqual('fail')
      expect(deleteReply.message).toEqual('data komentar tidak ditemukan')
    })

    it('should response 404 when reply not found', async () => {
      const requestPayload = {
        content: 'this is a reply.'
      }

      await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseDeleteReplies = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies/${'reply.id'}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const deleteReply = JSON.parse(responseDeleteReplies.payload)
      expect(responseDeleteReplies.statusCode).toEqual(404)
      expect(deleteReply.status).toEqual('fail')
      expect(deleteReply.message).toEqual('data balasan tidak ditemukan')
    })
  })
})
