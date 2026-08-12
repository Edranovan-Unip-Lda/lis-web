export const environment = {
    url: 'https://api-trade.belunintech.com',
    apiUrl: 'https://api-trade.belunintech.com/api/v1',
    // Must match the host staging is actually served from: it is the domain registered on the reCAPTCHA site
    // key below and on the backend's RECAPTCHA_EXPECTED_HOSTNAME. A stale value here is what produced the
    // `browser-error` tokens (key allow-list did not contain the serving host).
    webUrl: 'https://mcitradelicense.edranovan.com',
    production: false,
    sentryEnv: 'staging',
    recaptchaSiteKey: '6LdxdEssAAAAAGFKpOzYvRH7ipMMciSQ9qx4dD4-',
    testing: true // demo/practice build — shows testing banner + disables public search/QR
};
