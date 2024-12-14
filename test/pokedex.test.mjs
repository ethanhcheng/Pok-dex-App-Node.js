import fetch from 'node-fetch';
import http from 'http';
import assert from 'assert';
import app from '../src/app.mjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let server, url;
let cookies;

before(async () => {
  server = http.createServer(app);
  server.listen(0);
  url = `http://localhost:${server.address().port}`;

  const loginResponse = await fetch(`${url}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: 'ethanhcheng', password: 'test' })
  });

  if (loginResponse.ok) {
    cookies = loginResponse.headers.get('set-cookie'); // Save the cookie from the login response
  } else {
    throw new Error('Login failed');
  }
});

after(async () => {
  server.close();
  await mongoose.disconnect();
});

describe('Pokédex Application API Tests', () => {
  it('should fetch all pokemons based on a search term', async () => {
    const response = await fetch(`${url}/api/pokedex?search=saur`);
    if (response.ok) {
      const data = await response.json();
      assert(Array.isArray(data), 'Response should be an array');
    } else {
      console.error(await response.text());
    }
    assert.equal(response.status, 200, `Expected HTTP status 200 but got ${response.status}`);
  });

  it('should fetch a single pokemon details', async () => {
    const response = await fetch(`${url}/api/pokedex/Bulbasaur`);
    if (response.headers.get('Content-Type').includes('application/json')) {
        const data = await response.json();
        assert(data.pokemon.name === 'Bulbasaur', 'Pokemon name should be Bulbasaur');
    } else {
        throw new Error('Expected JSON response');
    }
  });  


  it('should fetch the user\'s team', async () => {
    const response = await fetch(`${url}/team`, {
      headers: { Cookie: cookies }
    });
    if (response.ok) {
      const data = await response.json();
      assert(Array.isArray(data), 'Response should be an array');
    } else {
      console.error(await response.text());
    }
    assert.equal(response.status, 200, `Expected HTTP status 200 but got ${response.status}`);
  });

  it('should add a Pokémon to the user\'s team', async () => {
    const response = await fetch(`${url}/team/add-exact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ searchTerm: 'Bulbasaur' })
    });
    if (response.ok) {
      const data = await response.json();
      assert(data.message.includes('Pokémon added successfully'), 'Response message should confirm addition');
    } else {
      console.error(await response.text());
    }
    assert.equal(response.status, 200, `Expected HTTP status 200 but got ${response.status}`);
  });

  it('should remove a Pokémon from the user\'s team', async () => {
    const pokemonId = '661a0f7bd0f52828ec69a9c4';
    const response = await fetch(`${url}/team/remove/${pokemonId}`, { method: 'DELETE' });
    if (response.ok) {
      const data = await response.json();
      assert(
        data.message.includes('Pokémon removed successfully') ||
        data.message.includes('No team found for guest.'), 
        'Response message should confirm removal');
    } else {
      console.error(await response.text());
    }
  });
});
