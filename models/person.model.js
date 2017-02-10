export default function (sequelize, DataTypes) {
  return sequelize.define('Person', {
      personId: DataTypes.INTEGER,
      image: DataTypes.STRING,
      name: DataTypes.STRING,
      nameEnglish: DataTypes.STRING,
      birthDay: DataTypes.DATE,
      nationality: DataTypes.STRING,
      likes: DataTypes.INTEGER,
      dislikes: DataTypes.INTEGER,
  }, {
    indexes: [
      { unique: true, fields: ['personId'] }
    ],
    classMethods: {
      associate(models) {
        this.belongsToMany(models.Movie, {
          through: {
            model: models.MovieStar,
            unique: false,
          },
          foreignKey: 'personId',
          constraints: false,
        });
      }
    }
  })
}