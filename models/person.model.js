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
      }
    }
  })
}