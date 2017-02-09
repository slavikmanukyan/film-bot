export default function (sequelize, DataTypes) {
  return sequelize.define('MovieStar', {
      personId: DataTypes.INTEGER,
      movieId: DataTypes.INTEGER,
      movieType: DataTypes.STRING,
      role: DataTypes.ENUM(['composer', 'actor', 'director']),
      rolePriority: DataTypes.INTEGER,
  }, {
    indexes: [
      { unique: true, fields: ['personId', 'movieId', 'movieType', 'role'] }
    ],
    classMethods: {
      associate(models) {
      }
    }
  })
}