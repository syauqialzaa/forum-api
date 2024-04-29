const AddThread = require('../add-thread')

describe('AddThread entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'this is title.'
    }

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      title: true,
      body: {},
      ownerId: {}
    }

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addThread object correctly', () => {
    const payload = {
      title: 'this is title.',
      body: 'this is body.',
      ownerId: 'user-123'
    }

    const addThread = new AddThread(payload)

    expect(addThread.title).toEqual(payload.title)
    expect(addThread.body).toEqual(payload.body)
    expect(addThread.ownerId).toEqual(payload.ownerId)
  })
})
