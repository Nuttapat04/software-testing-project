const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const BASE_URL = 'http://localhost:3000';
const mock = new MockAdapter(axios);
const app = require('./server'); 

test('Retrieving user information is user idempotent', async () => {
  mock.onGet(`${BASE_URL}/account/1`).reply(200, { user: 1, id: 'user1' });
  const Re1 = await axios.get(`${BASE_URL}/account/1`);
  const Re2 = await axios.get(`${BASE_URL}/account/1`);

  expect(Re1.status).not.toBe(404);
  expect(Re2.status).not.toBe(404);
  expect(Re1.data).toEqual(Re2.data);
});

test('Retrieving user information for different users', async () => {
  // Test for user 1
  mock.onGet(`${BASE_URL}/account/1`).reply(200, { user: 1, id: 'user1' });
  const response1 = await axios.get(`${BASE_URL}/account/1`);
  expect(response1.status).toBe(200);

  // Test for user 2
  mock.onGet(`${BASE_URL}/account/2`).reply(200, { user: 2, id: 'user2' });
  const response2 = await axios.get(`${BASE_URL}/account/2`);
  expect(response2.status).toBe(200);
});

test('Handling error responses gracefully', async () => {
  // Test scenario where the server returns 404 Not Found <-----failed
  mock.onGet(`${BASE_URL}/account/404`).reply(404);
  const response = await axios.get(`${BASE_URL}/account/404`);
  expect(response.status).toBe(404);

  // Test scenario where the server returns 500 Internal Server Error  <-----failed
  mock.onGet(`${BASE_URL}/account/500`).reply(500);
  const errorResponse = await axios.get(`${BASE_URL}/account/500`);
  expect(errorResponse.status).toBe(500);
});

afterAll(() => {
  mock.restore();
});