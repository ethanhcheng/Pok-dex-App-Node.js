import mongoose from'mongoose';

const teamSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  pokemons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pokemon'
  }]
});

teamSchema.pre('save', function(next) {
  if (this.pokemons.length > 6) {
    next(new Error('Cannot have more than 6 pokemons'));
  } else {
    next();
  }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
