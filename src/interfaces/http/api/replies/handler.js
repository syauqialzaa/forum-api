const AddReplyUseCase = require('../../../../applications/use_case/add-reply-use-case')
const DeleteReplyUseCase = require('../../../../applications/use_case/delete-reply-use-case')

class RepliesHandler {
  constructor (container) {
    this._container = container

    this.postReplyHandler = this.postReplyHandler.bind(this)
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this)
  }

  async postReplyHandler (request, h) {
    const { payload } = request
    const { params } = request
    const userId = request.auth.credentials.id
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name)
    const addedReply = await addReplyUseCase.execute(payload, params, userId)

    const response = h.response({
      status: 'success',
      data: {
        addedReply
      }
    })
    response.code(201)
    return response
  }

  async deleteReplyHandler (request, h) {
    const { params } = request
    const userId = request.auth.credentials.id
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name)
    await deleteReplyUseCase.execute(params, userId)

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }
}

module.exports = RepliesHandler
