const AuthenticationRepository = require('../../../domains/authentications/authentication-repository')
const DeleteAuthenticationUseCase = require('../delete-authentication-use-case')

describe('DeleteAuthenticationUseCase', () => {
  it('should throw error if use case payload not contain refresh token', async () => {
    const useCasePayload = {}
    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({})

    await expect(deleteAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')
  })

  it('should throw error if refresh token not string', async () => {
    const useCasePayload = {
      refreshToken: 123
    }
    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({})

    await expect(deleteAuthenticationUseCase.execute(useCasePayload))
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

    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository
    })

    await deleteAuthenticationUseCase.execute(useCasePayload)

    expect(mockAuthenticationRepository.checkAvailabilityToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationRepository.deleteToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
  })
})
