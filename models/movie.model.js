export default function (sequelize, DataTypes) {
  return sequelize.define('Movie', {
      movieId: DataTypes.INTEGER,
      image: DataTypes.STRING,
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      nameOriginal: DataTypes.STRING,
      year: DataTypes.INTEGER,
      likes: DataTypes.INTEGER,
      dislikes: DataTypes.INTEGER,
      time: DataTypes.INTEGER,
      genre: DataTypes.ARRAY(DataTypes.STRING),
      country: DataTypes.ARRAY(DataTypes.STRING),
  }, {
    indexes: [
      { unique: true, fields: ['movieId', 'type'] }
    ],
    classMethods: {
      associate(models) {
        this.belongsToMany(models.Person, {
          through: {
            model: models.MovieStar,
            unique: false,
          },
          foreignKey: 'movieId',
          constraints: false,
        });
      }
    }
  })
}