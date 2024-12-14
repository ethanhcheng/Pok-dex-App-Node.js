// import express from 'express';
// import Pokemon from '../models/pokemon.mjs';

// const router = express.Router();

// // router.get('/search-pokemon', async (req, res) => {
// //     try {
// //         const searchQuery = req.query.search || '';
// //         const regex = new RegExp(searchQuery, 'i');
// //         const pokemons = await Pokemon.find({ name: { $regex: regex } });
// //         res.json(pokemons);
// //     } catch (error) {
// //         res.status(500).send('Error retrieving Pokémon.');
// //     }
// // });

// // router.get('/pokedex', async (req, res) => {
// //     try {
// //         let query = {};
// //         if (req.query.search) {
// //             const regex = new RegExp(req.query.search, 'i');
// //             query.name = { $regex: regex };
// //         }
// //         const pokemons = await Pokemon.find(query);
// //         res.json(pokemons);
// //     } catch (error) {
// //         res.status

// export default router;

import express from 'express';
import Pokemon from '../models/pokemon.mjs';

const router = express.Router();

router.get('/search-pokemon', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const regex = new RegExp(searchQuery, 'i');
        const pokemons = await Pokemon.find({ name: { $regex: regex } });
        res.json(pokemons);
    } catch (error) {
        res.status(500).send('Error retrieving Pokémon.');
    }
});

router.get('/pokedex', async (req, res) => {
    try {
        let query = {};
        let search = req.query.search || ''; 
        if (search) {
            const regex = new RegExp(search, 'i');
            query.name = { $regex: regex };
        }
        const pokemons = await Pokemon.find(query);
        res.json(pokemons);  // Return JSON instead of rendering
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving Pokémon from the database.', error: error.toString() });
    }
});

router.get('/pokedex/:name', async (req, res) => {
    try {
        const pokemonName = req.params.name;
        const pokemon = await Pokemon.findOne({ name: pokemonName });
        if (!pokemon) {
            res.status(404).json({ message: 'Pokemon not found' });
        } else {
            const evolvesFrom = pokemon.evolvesFrom ? await Pokemon.findOne({ name: pokemon.evolvesFrom }) : null;
            const evolvesTo = pokemon.evolvesTo ? await Pokemon.findOne({ name: pokemon.evolvesTo }) : null;
            res.json({ pokemon, evolvesFrom, evolvesTo });  // Return JSON containing the pokemon details
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving Pokémon details.', error: error.toString() });
    }
});

export default router;

