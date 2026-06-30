// Same-origin "production parity" build, served by NGINX in front of the API on ONE origin.
// URLs are RELATIVE so the bundle is port/host-agnostic: every call resolves against the current
// origin and is proxied (/api/** -> backend) by nginx — reproducing prod's CSRF + cookie behaviour.
export const environment = {
    url: '/api',
    apiUrl: '/api/api/v1',
    webUrl: '',
    recaptchaSiteKey: '6LcNlVMsAAAAANtlr3dD611xHoj2XHrWpWeuKeih', // reCAPTCHA isn't on the auth/upload paths we test
    sentryEnv: 'local',
    testing: true // hides public search/QR so reCAPTCHA isn't required locally
};
