import config from 'config';
import Sequelize from 'sequelize';
import glob from 'glob';
import path from 'path';

// Make postgres return integers when using count methods
// https://github.com/sequelize/sequelize/issues/2383
require('pg').defaults.parseInt8 = true;

const modelsPath = glob.sync('./models/*.model.js');
const sequelize = new Sequelize(config.db.url, {
  logging: console.log, //process.env.NODE_ENV === 'production' ? false : console.log,
  define: {
    instanceMethods: {
      addDeletable(del) {
        this._deletables = this._deletables || [];
        if (Array.isArray(del)) {
          this._deletables.concat(del);
        } else this._deletables.push(del);
      }
    }
  }
});

const db = {};

modelsPath.forEach((file) => {
  const model = sequelize.import(path.join(process.cwd(), file));
  console.log(model.name)
  db[model.name] = model;
});

for (const model in db) {
  if (db[model].associate) {
    db[model].associate(db);
  }

  if (db[model].defineScopes) {
    db[model].defineScopes(db);
  }
}

module.exports = {
    ...db,
    sequelize,
    Sequelize,
    init() {
      return sequelize.sync();
    }
};
