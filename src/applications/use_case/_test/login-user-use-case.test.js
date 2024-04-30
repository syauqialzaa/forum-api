const UserRepository = require('../../../domains/users/user-repository')
const AuthenticationRepository = require('../../../domains/authentications/authentication-repository')
const AuthenticationTokenManager = require('../../security/authentication-token-manager')
const PasswordHash = require('../../security/password-hash')
const LoginUserUseCase = require('../login-user-use-case')
const NewAuth = require('../../../domains/authentications/entities/new-authentication')

describe('GetAuthenticationUseCase', () => {
  it('should orchestrating the get authentication action correctly', async () => {
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret'
    }
    const mockedAuthentication = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token'
    })
    const mockUserRepository = new UserRepository()
    const mockAuthenticationRepository = new AuthenticationRepository()
    const mockAuthenticationTokenManager = new AuthenticationTokenManager()
    const mockPasswordHash = new PasswordHash()

    mockUserRepository.getPasswordByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'))
    mockPasswordHash.comparePassword = jest.fn(() => Promise.resolve())
    mockAuthenticationTokenManager.createAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedAuthentication.accessToken))
    mockAuthenticationTokenManager.createRefreshToken = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedAuthentication.refreshToken))
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'))
    mockAuthenticationRepository.addToken = jest.fn(() => Promise.resolve())

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash
    })

    const actualAuthentication = await loginUserUseCase.execute(useCasePayload)

    expect(actualAuthentication).toEqual(mockedAuthentication)
    expect(mockUserRepository.getPasswordByUsername)
      .toBeCalledWith('dicoding')
    expect(mockPasswordHash.comparePassword)
      .toBeCalledWith('secret', 'encrypted_password')
    expect(mockUserRepository.getIdByUsername)
      .toBeCalledWith('dicoding')
    expect(mockAuthenticationTokenManager.createAccessToken)
      .toBeCalledWith({ username: 'dicoding', id: 'user-123' })
    expect(mockAuthenticationTokenManager.createRefreshToken)
      .toBeCalledWith({ username: 'dicoding', id: 'user-123' })
    expect(mockAuthenticationRepository.addToken)
      .toBeCalledWith(mockedAuthentication.refreshToken)
  })
})
