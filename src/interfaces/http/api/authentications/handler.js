const LoginUserUseCase = require('../../../../applications/use_case/login-user-use-case')
const RefreshAuthenticationUseCase = require('../../../../applications/use_case/refresh-authentication-use-case')
const LogoutUserUseCase = require('../../../../applications/use_case/logout-user-use-case')

class AuthenticationsHandler {
  constructor (container) {
    this._container = container

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this)
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this)
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this)
  }

  async postAuthenticationHandler (request, h) {
    const loginUserUseCase = this._container.getInstance(LoginUserUseCase.name)
    const { accessToken, refreshToken } = await loginUserUseCase.execute(request.payload)
    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken
      }
    })
    response.code(201)
    return response
  }

  async putAuthenticationHandler (request) {
    const refreshAuthenticationUseCase = this._container
      .getInstance(RefreshAuthenticationUseCase.name)
    const accessToken = await refreshAuthenticationUseCase.execute(request.payload)

    return {
      status: 'success',
      data: {
        accessToken
      }
    }
  }

  async deleteAuthenticationHandler (request) {
    const logoutUserUseCase = this._container.getInstance(LogoutUserUseCase.name)
    await logoutUserUseCase.execute(request.payload)
    return {
      status: 'success'
    }
  }
}

module.exports = AuthenticationsHandler
