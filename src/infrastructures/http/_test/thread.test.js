const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const AuthenticationsTableTestHelper = require('../../../../tests/authentications-table-test-helper')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const CommentsTableTestHelper = require('../../../../tests/comments-table-test-heper')
const RepliesTableTestHelper = require('../../../../tests/replies-table-test-helper')
const container = require('../../container')
const createServer = require('../create-server')

describe('/threads endpoint', () => {
  let server
  let accessToken
  const user = {
    username: 'alzasyauqi',
    password: 'secret_password',
    fullname: 'Alza Syauqi'
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'this is title.',
        body: 'this is body.'
      }

      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseThreads.payload)
      expect(responseThreads.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
    })

    it('should response 401 when user does not login', async () => {
      const requestPayload = {
        title: 'this is title.',
        body: 'this is body.'
      }

      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${'accessToken'}`
        }
      })

      expect(responseThreads.statusCode).toEqual(401)
    })

    it('should response 400 when request payload did not contain needed property', async () => {
      const requestPayload = {
        body: 'this is body.'
      }

      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseThreads.payload)
      expect(responseThreads.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        title: true,
        body: 'this is body.',
        owner: {}
      }

      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(responseThreads.payload)
      expect(responseThreads.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai')
    })
  })

  describe('when GET /threads', () => {
    it('should response 200 and persisted detail thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'user1'
      })
      await UsersTableTestHelper.addUser({
        id: 'user-222',
        username: 'user2'
      })

      const thread = await ThreadsTableTestHelper.addThread({
        id: 'thread-111',
        owner: 'user-111'
      })

      await CommentsTableTestHelper.addComment({
        id: 'comment-111',
        thread: thread.id,
        owner: 'user-111'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        thread: thread.id,
        owner: 'user-222'
      })

      await RepliesTableTestHelper.addReply({
        id: 'reply-111',
        comment: 'comment-111',
        owner: 'user-111'
      })
      await RepliesTableTestHelper.addReply({
        id: 'reply-222',
        comment: 'comment-111',
        owner: 'user-222'
      })

      const responseThreads = await server.inject({
        method: 'GET',
        url: `/threads/${thread.id}`
      })

      const responseJson = JSON.parse(responseThreads.payload)
      expect(responseThreads.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data).toBeDefined()
      expect(responseJson.data.thread).toBeDefined()
      expect(responseJson.data.thread.comments).toHaveLength(2)
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2)
    })

    it('should response 404 when thread not found', async () => {
      const responseThreads = await server.inject({
        method: 'GET',
        url: `/threads/${'thread.id'}`
      })

      const responseJson = JSON.parse(responseThreads.payload)
      expect(responseThreads.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('data thread tidak ditemukan')
    })
  })
})
