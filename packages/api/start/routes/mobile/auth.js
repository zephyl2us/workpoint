'use strict'

const Route = use('Route')

Route.group(() => {

  Route.post('auth/login', 'IndexController.login')
    .validator('Mobile/AuthLoginStore')

  Route.post('auth/otp', 'IndexController.requestOtp')
    .validator('Mobile/AuthRequestOtp')

  Route.post('auth/verify', 'IndexController.verifyOtp')
    .validator('Mobile/AuthVerifyOtp')

  Route.post('auth/register', 'IndexController.register')
    .validator('Mobile/AuthRegisterStore')

    Route.post('auth/forgot/otp', 'IndexController.forgotRequestOtp')
    .validator('Mobile/AuthRequestOtp')

  Route.post('auth/forgot/verify', 'IndexController.verifyOtp')
    .validator('Mobile/AuthVerifyOtp')

  Route.post('auth/forgot/changepassword', 'IndexController.forgotResetPassword')
    .validator('Mobile/AuthRegisterStore')

  Route.get('auth/me', 'IndexController.me')
    .middleware(['auth'])

})
.namespace('Mobile/Auth')
.prefix('v1/:app')