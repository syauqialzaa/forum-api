const DetailThread = require('../detail-thread')

describe('DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'this is title.'
    }

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: {},
      title: {},
      body: {},
      date: {},
      username: {},
      comments: {}
    }

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create DetailThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'this is title.',
      body: 'this is body.',
      username: 'alzasyauqi',
      date: '2024-04-27T18:00:12.306Z',
      comments: [{}]
    }

    const detailThread = new DetailThread(payload)

    expect(detailThread.id).toEqual(payload.id)
    expect(detailThread.title).toEqual(payload.title)
    expect(detailThread.body).toEqual(payload.body)
    expect(detailThread.username).toEqual(payload.username)
    expect(detailThread.date).toEqual(payload.date)
    expect(detailThread.comments).toEqual(payload.comments)
  })
})
