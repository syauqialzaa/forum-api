const AddReply = require('../add-reply')

describe('AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'this is a reply.'
    }

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: true,
      comment: true,
      owner: true
    }

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addReply object correctly', () => {
    const payload = {
      content: 'this is a reply.',
      comment: 'comment-123',
      owner: 'user-123'
    }

    const addReply = new AddReply(payload)

    expect(addReply.content).toEqual(payload.content)
    expect(addReply.comment).toEqual(payload.comment)
    expect(addReply.owner).toEqual(payload.owner)
  })
})
