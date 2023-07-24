const express = require('express')
const mysql = require('mysql');
const myconn = require('express-myconnection');
const cors = require('cors')

const routes = require('./routes')

const app = express()

app.set('port', process.env.PORT || 5176)
 

const dbOptions = {

    host: 'database-cadofi-pi.cb818gwnhvze.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'admin',   
    password: '12345678',
    database: 'cadofi'

}

app.use(myconn(mysql, dbOptions, 'single'))
app.use(express.json())
app.use(cors())

//routes-------------------------
app.get('/', (req, res) => {

    res.send('Welcome to my API');

})


app.use('/api', routes)

// server running----------------------------
app.listen(app.get('port'), () => {

    console.log('Server running on port', app.get('port'))

})
