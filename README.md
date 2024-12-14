# Gen 1 Pokedex

## Overview


I want to create a web app to act as a pokedex for the first generation of pokemon.  I want the web app to allow a user to log in and be able to view a database of the first 151 pokemon or all the pokemon that appear in generation 1.  The user will be able to log in because I want them to be able to create a team of 6 pokemon.  The user will be able to either add up to 6 pokemon to their team and switch them out with others in the pokedex as they desire.


## Data Model

The application will store Pokemon, The user's team, and Users.

* Users will have one team (via reference)
* Each team can have up to 6 pokemon (by embedding)


An Example User:

```javascript
{
  username: "Ash",
  hash: // a password hash
  Team: // an array referencing a team document
}
```

An Example Team:

```javascript
{
  user: // a reference to a User object
  name: "Team",
  Pokemon: [
    { name: "Pikachu", species: "Mouse Pokemon", number: "25", type: "Electric", ability: "Static", height: " 1 ft 4 in ", weight: "13.2 lbs", description: "When several of these Pokemon gather, their electricity could build and cause lightning storms."},
    { name: "Charizard", species: "Flame Pokemon", number: "6", type: "Fire, Flying", ability: "Blaze", height: " 5 ft 7 in ", weight: "199.5 lbs", description: "Spits fire that is hot enough to melt boulders.  Known to cause forest fires unintentionally."},
  ],
}
```

An Example In-Depth Pokedex Entry
```javascript
{
  name: "Pikachu", 
  species: "Mouse Pokemon", 
  number: "25", 
  type: "Electric", 
  ability: "Static", 
  height: " 1 ft 4 in ", 
  weight: "13.2 lbs", 
  description: "When several of these Pokemon gather, their electricity could build and cause lightning storms." 
}
```

An Example Pokedex:
```javascript
{
  Pokemon: [
    { number: "25", 
      name: "Pikachu"},
    { number: "6", 
      name: "Charizard" }
  ],
}
```


## [Link to Commented First Draft Schema](src/db.mjs) 


## Wireframes

/Team - display team allow user to add pokemon up to 6 to their team

![Team](documentation/team.heic)

/pokedex - Display all the pokemon in gen 1 and allow a user to add a pokemon up to 6 to their team from this list

![Pokedex](documentation/pokedex.heic)

/pokedex/pikachu - I am going to try for each pokemon in the database, the user can click on it for extended information.  I am not sure how feasible this is.

![Pokedex-indepth](documentation/indepth.heic)


## Site map

![Site-Map](documentation/sitemap.heic)


## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site and view the pokedex database
2. as a user, I can log in to the site
3. as a user, I can create or view my existing Team
4. as a user, I can view the entire pokedex database
5. as a user, I can add new pokemon, up to 6, to my team
6. as a user, I can remove pokemon from my team to free up space for a new one

## Research Topics


* (5 points) Integrate user authentication via passport
* (2 points) Integrate advanced UI with CSS?
* (3 points) Use Mocha for testing
* Research topics may change


## [Link to Initial Main Project File](src/app.mjs) 


## Annotations / References Used


1. [passport.js authentication docs](http://passportjs.org/docs) 
2. [mocha.js] (https://mochajs.org)
3. [css] (https://developer.mozilla.org/en-US/docs/Web/CSS)

