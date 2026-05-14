@component('mail::message')
# Password Reset Code

Hello,

You requested to reset your password. Use the code below. It expires in **15 minutes**.

@component('mail::panel')
# {{ $otp }}
@endcomponent

If you did not request a password reset, ignore this email.

Thanks,
{{ config('app.name') }}
@endcomponent