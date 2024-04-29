class AddThread {
  constructor (payload) {
    this._verifyPayload(payload)
    const { title, body, ownerId } = payload

    this.title = title
    this.body = body
    this.ownerId = ownerId
  }

  _verifyPayload ({ title, body, ownerId }) {
    if (!title || !body || !ownerId) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddThread
