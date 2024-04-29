const AddedThread = require('../added-thread')

describe('AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123'
    }

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: true,
      title: {},
      ownerId: {}
    }

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'this is title.',
      ownerId: 'user-123'
    }

    const addedThread = new AddedThread(payload)

    expect(addedThread.id).toEqual(payload.id)
    expect(addedThread.title).toEqual(payload.title)
    expect(addedThread.ownerId).toEqual(payload.ownerId)
  })
})
