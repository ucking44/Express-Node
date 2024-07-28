const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()
const tableName = "tickets"
const sqlQuery = "SELECT * FROM " + tableName

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(2222, () => {
    console.log('Server is Listening on port 2222...')
})

const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'phprest'
})

db.connect((err) => {
    if(err) {
        console.log('Unable to connect to DB...')
    }
    else {
        console.log('Database Connected Successfully!')
    }
})

function queryPromise(sql, values = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if(error) {
                reject(error)
            }
            else {
                resolve(results)
            }
        })
    })
}

app.post('/tickets', async(req, res) => {
    try {
        /// COLLECT ALL DATA THAT COMES FROM REQUEST BODY
        var { title, description, active } = req.body
        /// VALIDATE
        if (!title || !description) {
            throw new Error("Title and Description Are Required")
        }
        /// BY DEFAULT WE ARE SETTING ACTIVE AS TRUE
        if (!active) {
            active = true
        }
        // BUILDING THE QUERY
        const issue = [ title, description, active ] 
        const SQL = "INSERT INTO " + tableName + " (title, description, active) VALUES (?, ?, ?)"
        /// EXECUTING THE QUERY result.insertId
        const result = await queryPromise(SQL, issue)
        res.json({ id: result.insertId, title, description, active })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: "Failed to fetch the ticket details..."
        })
    }
})

app.get('/tickets/search', async(req, res) => {
    try {
        // COLLECT THE QUERY
        const query = req.query.q
        const SQL = sqlQuery + " WHERE title LIKE ? OR description LIKE ?"
        const results = await queryPromise(SQL, [`%${query}%`, `%${query}%`])
        if (results.length === 0) {
            res.status(200).json({ msg: "No Matching Record Found", length: results.length})
        }
        else {
            res.status(200).json({ results: results, length: results.length })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Failed to search the tickets..."
        })
    }
})

app.get('/tickets/:id', async(req, res) => {
    try {
        // GET THE ID FROM URL
        const { id } = req.params
        // BUILD THE QUERY
        var SQL = sqlQuery + " WHERE id = ?"
        const results = await queryPromise(SQL, [id])
        if (results.length === 0) {
            res.status(404).json({
                error: "No Matching Tickets Found..."
            })
        }
        else {
            res.status(200).json(results[0])
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: "Failed to fetch the ticket details..."
        })
    }
})

app.get('/tickets', async(req, res) => {
    try {
        var SQL = sqlQuery
        const results = await queryPromise(SQL)
        if(!results) {
            res.status(404).json({
                error: "No Was Found"
            })
        }
        else {
            res.status(200).json(results)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Failed to fetch tickets..."
        })
    }
})

app.put('/tickets/:id', async(req, res) => {
    try {
        /// COLLECT DATA TO PROCESS 
        const { id } = req.params
        const { title, description, active } = req.body
        const queryBody = [ title, description, active, id ]
        ///  VALIDATION => CHECK IF DATA IS EMPTY, DATA TYPE

        // BUILD THE QUERY
        const SQL = "UPDATE " + tableName + " SET title = ?, description = ?, active = ?  WHERE id = ?"
        const result = await queryPromise(SQL, queryBody)
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                error: "Unable to find the matching ticket"
            })
        }
        else {
            res.status(200).json({
                id: id, title, description, active
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Failed to update the ticket..."
        })
    }
})

app.delete('/tickets/:id', async(req, res) => {
    try {
        /// COLLECT DATA TO PROCESS
        const { id } = req.params
        //const queryBody = [ title, description, active, id ]
        ///  VALIDATION => CHECK IF DATA IS EMTY, DATA TYPE

        // BUILD THE QUERY
        const SQL = "DELETE FROM " + tableName + " WHERE id = ?"
        const result = await queryPromise(SQL, id)
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                error: "Unable to find the matching ticket with the id of " + Number(id)
            })
        }
        else {
            res.status(200).json({
                message: "Ticket with the id of " + Number(id) + " was Successfully deleted"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Failed to Delete the ticket..."
        })
    }
})

// app.post('/tickets/people', async(req, res) => {
//     try {
//         /// COLLECT ALL DATA THAT COMES FROM REQUEST BODY
//         const morePeople = []
//         var { title, description, active } = req.body
//         /// VALIDATE
//         if (!title || !description) {
//             throw new Error("Title and Description Are Required")
//         }
//         /// BY DEFAULT WE ARE SETTING ACTIVE AS TRUE
//         if (!active) {
//             active = true
//         }
        
//         // BUILDING THE QUERY
//         const issue = [ title, description, active ]
//         const newPeople = morePeople.map((people) => {
//             //if (person.id === Number(id)) {
//                 people.title = title
//                 people.description = description
//                 people.active = active
//             //}
//             return people
//         })

//         const SQL = "INSERT INTO " + tableName + " (title, description, active) VALUES (?, ?, ?)"
//         /// EXECUTING THE QUERY result.insertId
//         const result = await queryPromise(SQL, issue)
//         res.json({ id: result.insertId, title, description, active })
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: "Failed to fetch the ticket details..."
//         })
//     }
// })


