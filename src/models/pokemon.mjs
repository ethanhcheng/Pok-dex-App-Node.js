import mongoose from 'mongoose';

const PokemonSchema = new mongoose.Schema({
	name:{type: String, required: true},
	number:{type: Number, required: true},
	species:{type: String, required: true},
	type:{type: [String], required: true},
	ability:{type: [String], required: true},
	height:{type: String, required: true},
	weight:{type: String, required: true},
	description:{type: String, required: true},
    imageURL: {type: String, required: true},
	evolvesFrom: { type: String }, 
    evolvesTo: { type: String }
});

const Pokemon = mongoose.model('Pokemon', PokemonSchema);
export default Pokemon;
