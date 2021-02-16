const dbconfig = process.env.NODE_ENV.trim() == "development" ?
  {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "audax_db",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
  :
  {
    HOST: "localhost",
    USER: "ukcourie_audaxuser",
    PASSWORD: "xx786FE%$Ac1",
    DB: "ukcourie_audax",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
  
module.exports = dbconfig