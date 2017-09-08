const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const Sequelize = require('sequelize')
const fs = require('fs')

// db
const db = new Sequelize(process.env.DATABASE_URL, { logging: false })
const Item = db.define('items', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
})

function seed () {
  return Promise.all([
    Item.create({ name: 'Stuff' }),
    Item.create({ name: ':O' }),
    Item.create({ name: 'Doin it!!' })
  ])
}

// routes
const app = express()
app.use('/jquery', express.static(`${__dirname}/node_modules/jquery/dist`))
app.use(bodyParser.json())

app.get('/', (req, res, next)=> {
  Item.findAll()
  .then(items=> {
    fs.readFile(`${__dirname}/index.html`, function(err, data) {
      let file = data.toString().replace(/{{ items }}/, `
        ${ items.reduce((lis, i)=> {
            return lis += `<li>${ i.name }</li>`
          }, '')}
      `)
      res.send(file)
    })
  })
})

app.post('/items', (req, res, next)=> {
  Item.create(req.body)
    .then(item=> res.send(item))
})

const port = process.env.PORT || 3000

db.sync({ force: true })
  .then(()=> seed())
  .then(()=> {
    app.listen(port, ()=> {
      console.log(`listening on port ${port}`)
    })
  })
