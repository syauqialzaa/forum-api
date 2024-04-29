const AddComment = require('../add-comment')

describe('AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'this is a comment.'
    }

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: true,
      threadId: true,
      ownerId: true
    }

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addComment object correctly', () => {
    const payload = {
      content: 'this is a comment.',
      threadId: 'thread-123',
      ownerId: 'user-123'
    }

    const addComment = new AddComment(payload)

    expect(addComment.content).toEqual(payload.content)
    expect(addComment.threadId).toEqual(payload.threadId)
    expect(addComment.ownerId).toEqual(payload.ownerId)
  })
})
