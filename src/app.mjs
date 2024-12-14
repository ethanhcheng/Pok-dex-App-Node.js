import './config.mjs';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/user.mjs';
import Pokemon from './models/pokemon.mjs';
import Team from './models/team.mjs';
import pokemonRoutes from './routes/pokemonRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const app = express();
const PORT = process.env.PORT || 9000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        autoRemove: 'native',
        autoRemoveInterval: 10
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api', pokemonRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/team.html',
    failureRedirect: '/login?error=Invalid username or password'
}));

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.redirect('/register?error=' + encodeURIComponent(err.message));
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/team.html');
        });
    });
});

app.get('/api/current-user', (req, res) => {
    if (req.user) {
        res.json({ username: req.user.username });
    } else {
        res.json({ username: "Guest" });
    }
});

// Change logout to handle POST requests
app.post('/logout', (req, res) => {
    console.log('Attempting to log out user:', req.user);
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.redirect('/login');
        }
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.redirect('/login');
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect('/');
        });
    });
});



app.get('/team', async (req, res) => {
    if (req.user) {
        try {
            const team = await Team.findOne({ user: req.user._id }).populate('pokemons');
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            res.json(team.pokemons.map(pokemon => ({ name: pokemon.name, imageURL: pokemon.imageURL, _id: pokemon._id })));
        } catch (error) {
            console.error('Error retrieving team:', error);
            res.status(500).json({ message: 'Error retrieving team' });
        }
    } else {
        res.json(req.session.guestTeam || []);
    }
});



app.post('/team/add-exact', async (req, res) => {
    console.log("Request body:", req.body);
    const { searchTerm } = req.body;
    const regex = new RegExp(`^${searchTerm}$`, 'i');
    try {
        const pokemon = await Pokemon.findOne({ name: { $regex: regex } });
        if (!pokemon) {
            return res.status(404).json({ message: 'No exact match found.' });
        }
        if (req.user) {
            let team = await Team.findOne({ user: req.user._id });
            if (!team) {
                team = new Team({ user: req.user._id, pokemons: [] });
            }

            if (team.pokemons.length >= 6) {
                return res.status(400).json({ message: 'You can only have up to 6 Pokémon in your team.' }); 
            }

            team.pokemons.push(pokemon._id);
            await team.save();
            res.json({ message: 'Pokémon added successfully', pokemonName: pokemon.name }); 
        } else {
            if(!req.session.guestTeam) {
                req.session.guestTeam = [];
            }
            if (req.session.guestTeam.length >= 6) {
                return res.status(400).json({ message: 'You can only have up to 6 Pokémon in your team.' });
            }
            req.session.guestTeam.push({ name: pokemon.name, imageURL: pokemon.imageURL, _id: pokemon._id });
            res.json({ message: 'Pokémon added successfully', pokemonName: pokemon.name });
        }

    } catch (error) {
        console.error("Error adding to team:", error);
        res.status(500).json({ message: 'Error adding to team: ' + error.message });
    }
});


app.get('/team/search-partial', async (req, res) => {
    const { searchTerm } = req.query;
    const regex = new RegExp(searchTerm, 'i'); 
    const pokemons = await Pokemon.find({ name: { $regex: regex } });
    res.json(pokemons);
});


app.delete('/team/remove/:pokemonId', async (req, res) => {
    const { pokemonId } = req.params;

    // Check if the Pokemon ID is valid to avoid errors and potential security issues.
    if (!mongoose.Types.ObjectId.isValid(pokemonId)) {
        return res.status(400).json({ message: 'Invalid Pokémon ID.' });
    }

    try {
        if (req.user) {
            const result = await Team.updateOne(
                { user: req.user._id },
                { $pull: { pokemons: new mongoose.Types.ObjectId(pokemonId) } }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ message: 'Pokémon not found in team or team does not exist.' });
            }

            res.json({ message: 'Pokémon removed successfully from team.' });
        } else {
            if (!req.session.guestTeam) {
                return res.status(404).json({ message: 'No team found for guest.' });
            }

            // Find and remove the Pokémon from the guest session team
            const index = req.session.guestTeam.findIndex(pokemon => pokemon._id.toString() === pokemonId);
            if (index === -1) {
                return res.status(404).json({ message: 'Pokémon not found in team.' });
            }

            req.session.guestTeam.splice(index, 1);
            res.json({ message: 'Pokémon removed successfully from session team.' });
        }
    } catch (error) {
        console.error('Error removing Pokémon from team:', error);
        res.status(500).json({ message: 'Error removing Pokémon from team: ' + error.message });
    }
});



app.get('/pokedex', async (req, res) => {
    try {
        let query = {};
        let search = req.query.search || ''; 
        if (search) {
            const regex = new RegExp(search, 'i'); 
            query.name = { $regex: regex };
        }
        const pokemons = await Pokemon.find(query);
        res.render('pokedex', { pokemons, search: search });  
    } catch (error) {
        res.status(500).send('Error retrieving Pokémon from the database.');
    }
});

app.get('/pokedex/:name', async (req, res) => {
    try {
        const pokemonName = req.params.name;
        const pokemon = await Pokemon.findOne({ name: pokemonName });
        if (!pokemon) {
            return res.status(404).send('Pokemon not found');
        }

        const evolvesFrom = pokemon.evolvesFrom ? await Pokemon.findOne({ name: pokemon.evolvesFrom }) : null;
        const evolvesTo = pokemon.evolvesTo ? await Pokemon.findOne({ name: pokemon.evolvesTo }) : null;

        res.render('pokemondetails', { pokemon, evolvesFrom, evolvesTo }); 
    } catch (error) {
        res.status(500).send('Error retrieving Pokémon details.');
    }
});

app.get('/team.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'team.html'));
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.log('Error connecting to MongoDB Atlas:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
