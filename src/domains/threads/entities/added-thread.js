class AddedThread {
  constructor (payload) {
    this._verifyPayload(payload)
    const { id, title, ownerId } = payload

    this.id = id
    this.title = title
    this.ownerId = ownerId
  }

  _verifyPayload ({ id, title, ownerId }) {
    if (!id || !title || !ownerId) {
      throw new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddedThread
