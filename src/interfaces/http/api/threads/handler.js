const AddThreadUseCase = require('../../../../applications/use_case/add-thread-use-case')
const GetDetailThreadUseCase = require('../../../../applications/use_case/get-detail-thread-use-case')

class ThreadsHandler {
  constructor (container) {
    this._container = container

    this.postThreadHandler = this.postThreadHandler.bind(this)
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this)
  }

  async postThreadHandler (request, h) {
    const { payload } = request
    const userId = request.auth.credentials.id
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute(payload, userId)

    const response = h.response({
      status: 'success',
      data: {
        addedThread
      }
    })
    response.code(201)
    return response
  }

  async getDetailThreadHandler (request, h) {
    const payload = { id: request.params.threadId }
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name)
    const detailThread = await getDetailThreadUseCase.execute(payload)

    const response = h.response({
      status: 'success',
      data: {
        thread: detailThread
      }
    })
    response.code(200)
    return response
  }
}

module.exports = ThreadsHandler
