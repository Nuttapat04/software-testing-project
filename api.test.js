const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

// Assuming BASE_URL is defined somewhere in your setup
const BASE_URL = 'http://localhost:3000';
const mock = new MockAdapter(axios);

describe('API Tests', () => {
  // Assuming a successful login response for testing HTTP status codes
  const authResponse = { token: 'some_token' };

  beforeAll(() => {
    // Mocking the axios post method for login
    jest.spyOn(axios, 'post').mockImplementation((url, data) => {
      // Simulating the behavior of authentication with different credentials
      if (data.username === 'user1' && data.password === 'password123') {
        return Promise.resolve({ status: 200, data: authResponse });
      } else {
        return Promise.reject({ response: { status: 401 } });
      }
    });

    // Mocking additional endpoints for testing
    mock.onGet(`${BASE_URL}/idempotent`).reply(200, { id: 'data1' });
    mock.onGet(`${BASE_URL}/safe`).reply(200, { message: 'This is a safe request' });
    mock.onPost(`${BASE_URL}/translate`).reply(200, { translated_text: 'Hello' });
  });

  it('Valid login: Valid username, Valid Password', async () => {
    const response = await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'password123' });
    expect(response.status).toBe(200);
    expect(response.data.token).toBeTruthy();
  });

  it('Invalid login: Invalid username', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'invalid_user', password: 'password123' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Invalid login: Invalid password', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'invalid_password' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Missing username', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { password: 'password123' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Missing password', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'user1' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Empty credentials', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: '', password: '' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Incorrect combination of username and password', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'wrong_password' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Account locked', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'locked_user', password: 'password123' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Account disabled', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'disabled_user', password: 'password123' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('Unauthorized access: Account expired', async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { username: 'expired_user', password: 'password123' });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

test('Idempotent property', async () => {
  // Mocking a request that returns the same data on multiple calls
  mock.onGet(`${BASE_URL}/idempotent`).reply(200, { id: 'data1' });

  // Sending two identical requests
  const response1 = await axios.get(`${BASE_URL}/idempotent`);
  const response2 = await axios.get(`${BASE_URL}/idempotent`);

  // Expecting the same data
  expect(response1.data).toEqual(response2.data);
});

test('Safe property', async () => {
  // Mocking a safe request that does not change server state
  mock.onGet(`${BASE_URL}/safe`).reply(200, { message: 'This is a safe request' });

  // Sending a safe request
  const response = await axios.get(`${BASE_URL}/safe`);

  // Expecting a successful response
  expect(response.status).toBe(200);
  expect(response.data.message).toBe('This is a safe request');
});

 ///////////////////////////////////////////// HTTP ///////////////////////////////////////////////////////////
 test('HTTP status codes', async () => {
  // Mocking various HTTP status codes
  mock.onGet(`${BASE_URL}/status/200`).reply(200);
  mock.onGet(`${BASE_URL}/status/400`).reply(400);
  mock.onGet(`${BASE_URL}/status/401`).reply(401);
  mock.onGet(`${BASE_URL}/status/403`).reply(403);
  mock.onGet(`${BASE_URL}/status/404`).reply(404);
  mock.onGet(`${BASE_URL}/status/500`).reply(500);

  try {
    // Perform authentication
    const authResponse = await axios.post(`${BASE_URL}/login`, { username: 'Doktong', password: 'Abc123456' });
    const token = authResponse.data.token;

    // Testing different status codes with authentication
    const responses = await Promise.all([
      axios.get(`${BASE_URL}/status/200`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/status/400`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/status/401`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/status/403`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/status/404`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/status/500`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    // Expecting correct status codes
    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(400);
    expect(responses[2].status).toBe(401);
    expect(responses[3].status).toBe(403);
    expect(responses[4].status).toBe(404);
    expect(responses[5].status).toBe(500);
  } catch (error) {
    // If authentication fails, throw an error
    throw new Error('Authentication failed');
  }
});

test('Functional testing', async () => {
  // Mocking a translation API that translates Thai to English
  mock.onPost(`${BASE_URL}/translate`).reply(200, { translated_text: 'Hello' });

  // Sending a Thai text to translate
  const response = await axios.post(`${BASE_URL}/translate`, { text: 'สวัสดี' });

  // Expecting the translated text in English
  expect(response.status).toBe(200);
  expect(response.data.translated_text).toBe('Hello');
});

afterAll(() => {
  mock.restore();
});
});