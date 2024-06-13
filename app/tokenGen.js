const { sign } = require('jsonwebtoken');
const crypto = require('crypto');

export const tokenGen = () => {
    const key_name       = "organizations/b0e2f565-7b25-4fac-814a-b8e1bc701218/apiKeys/63ea529a-26f3-4c6c-8a22-a0070a7f2eee";
    const key_secret = "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEII6ljJBfA19lUrIMkwzRKxyKl+UG1ZJAAn69NGhMGhY1oAoGCCqGSM49\nAwEHoUQDQgAEzxNxqeAzv+GiIXw3dncNjewyXcAalzpYlrDbp1vZPxhRjMP2zaqY\nq6s69MBl59EjK40Cod1GTGEe8cnDVSduzw==\n-----END EC PRIVATE KEY-----\n"
    const request_method = 'GET';
    const url = "api.developer.coinbase.com";
    const request_path = '/onramp/v1/buy/config';

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign({
			iss: 'cdp',
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 120,
			sub: key_name,
			uri,
		},
		key_secret,
		{
			algorithm,
			header: {
				kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
			},
		});

    return token
}
