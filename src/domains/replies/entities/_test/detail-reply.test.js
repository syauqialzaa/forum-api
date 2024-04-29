const DetailReply = require('../detail-reply')

describe('DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123'
    }

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: true,
      content: true,
      date: '2024-04-29T16:04:20.760Z',
      username: true
    }

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create detailReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'this is a reply.',
      date: '2024-04-29T16:04:20.760Z',
      username: 'alzasyauqi'
    }

    const detailReply = new DetailReply(payload)

    expect(detailReply.id).toEqual(payload.id)
    expect(detailReply.content).toEqual(payload.content)
    expect(detailReply.date).toEqual(payload.date)
    expect(detailReply.username).toEqual(payload.username)
  })
})
