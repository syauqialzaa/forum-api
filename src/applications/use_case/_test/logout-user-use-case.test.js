const AuthenticationRepository = require('../../../domains/authentications/authentication-repository')
const LogoutUserUseCase = require('../logout-user-use-case')

describe('LogoutUserUseCase', () => {
  it('should throw error if use case payload not contain refresh token', async () => {
    const useCasePayload = {}
    const logoutUserUseCase = new LogoutUserUseCase({})

    await expect(logoutUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')
  })

  it('should throw error if refresh token not string', async () => {
    const useCasePayload = {
      refreshToken: 123
    }
    const logoutUserUseCase = new LogoutUserUseCase({})

    await expect(logoutUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the delete authentication action correctly', async () => {
    const useCasePayload = {
      refreshToken: 'refreshToken'
    }

    const mockAuthenticationRepository = new AuthenticationRepository()

    mockAuthenticationRepository.checkAvailabilityToken = jest.fn(() => Promise.resolve())
    mockAuthenticationRepository.deleteToken = jest.fn(() => Promise.resolve())

    const logoutUserUseCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthenticationRepository
    })

    await logoutUserUseCase.execute(useCasePayload)

    expect(mockAuthenticationRepository.checkAvailabilityToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationRepository.deleteToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
  })
})
