const pool = require('../../database/postgres/pool')
const ThreadsTableTestHelper = require('../../../../tests/threads-table-test-helper')
const UsersTableTestHelper = require('../../../../tests/users-table-test-helper')
const NotFoundError = require('../../../commons/exceptions/not-found-error')
const AddThread = require('../../../domains/threads/entities/add-thread')
const AddedThread = require('../../../domains/threads/entities/added-thread')
const ThreadRepositoryPostgres = require('../thread-repository-postgres')

describe('ThreadRepositoryPostgres', () => {
  const userIdCredentials = 'user-123'

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userIdCredentials,
      username: 'alzasyauqi'
    })
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      const addThread = new AddThread({
        title: 'this is title.',
        body: 'this is body.',
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      await threadRepositoryPostgres.addThread(addThread)

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123')
      expect(threads).toHaveLength(1)
    })

    it('should return added thread correctly', async () => {
      const addThread = new AddThread({
        title: 'this is title.',
        body: 'this is body.',
        owner: userIdCredentials
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      const addedThread = await threadRepositoryPostgres.addThread(addThread)

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'this is title.',
          owner: userIdCredentials
        })
      )
    })
  })

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      return expect(threadRepositoryPostgres.verifyAvailableThread('thread-123')).rejects.toThrowError(NotFoundError)
    })

    it('should return id when thread is found', async () => {
      const thread = await ThreadsTableTestHelper.addThread({
        owner: userIdCredentials
      })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      const checkThread = await threadRepositoryPostgres.verifyAvailableThread(thread.id)

      expect(checkThread.id).toEqual(thread.id)
    })
  })

  describe('getThreadById function', () => {
    it('should run function getThreadById correctly and return expected properties', async () => {
      const thread = {
        id: 'thread-123',
        title: 'this is title.',
        body: 'this is body.',
        owner: userIdCredentials
      }
      await ThreadsTableTestHelper.addThread({ ...thread })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      const detailThread = await threadRepositoryPostgres.getThreadById(thread.id)

      console.log(thread)
      expect(detailThread.id).toStrictEqual(thread.id)
      expect(detailThread.title).toStrictEqual(thread.title)
      expect(detailThread.body).toStrictEqual(thread.body)
      expect(detailThread.date).toStrictEqual(expect.any(Date))
      expect(detailThread.username).toStrictEqual('alzasyauqi')
      expect(detailThread).toHaveProperty('id')
      expect(detailThread).toHaveProperty('title')
      expect(detailThread).toHaveProperty('body')
      expect(detailThread).toHaveProperty('date')
      expect(detailThread).toHaveProperty('username')
    })
  })
})
