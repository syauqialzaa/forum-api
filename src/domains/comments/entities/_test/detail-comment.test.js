const DetailComment = require('../detail-comment')

describe('DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123'
    }

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: true,
      username: true,
      date: '2024-04-29T15:20:59.809Z',
      content: true,
      replies: [{}],
      likeCount: '0'
    }

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create detailComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'alzasyauqi',
      date: '2024-04-29T15:20:59.809Z',
      content: 'this is a comment.',
      replies: [{}],
      likeCount: 0
    }

    const detailComment = new DetailComment(payload)

    expect(detailComment.id).toEqual(payload.id)
    expect(detailComment.username).toEqual(payload.username)
    expect(detailComment.date).toEqual(payload.date)
    expect(detailComment.replies).toEqual(payload.replies)
    expect(detailComment.content).toEqual(payload.content)
  })
})
