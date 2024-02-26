const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null
const initialise = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initialise()

const playerDetailsTable = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
  }
}

//API1
app.get('/players/', async (request, response) => {
  const getAllPlayers = `
    SELECT 
    *
    FROM
    player_details
    
  `
  const api1 = await db.all(getAllPlayers)
  response.send(api1.map(player => playerDetailsTable(player)))
})

//API2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `
    SELECT 
    *
    FROM
    player_details
    WHERE
    player_id=${playerId}
  `
  const api2 = await db.get(getPlayer)
  response.send(playerDetailsTable(api2))
})

//API3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const putPlayer = `
    SELECT 
    player_name as playerName
    FROM
    player_details
    WHERE
    player_id=${playerId}
  `
  await db.run(putPlayer)
  response.send('Player Details Updated')
})

const matchDetailsTable = dbObj => {
  return {
    matchId: dbObj.match_id,
    match: dbObj.match,
    year: dbObj.year,
  }
}

//API4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchId = `
      SELECT 
      *
      FROM
      match_details
      WHERE
      match_id=${matchId}
   `
  const api4 = await db.get(getMatchId)
  response.send(matchDetailsTable(api4))
})

//API5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchOfPlayer = `
      SELECT
      match_id as matchId,
      match,
      year
      FROM
      player_match_score NATURAL JOIN match_details
      WHERE
      player_match_score.player_id=${playerId}`
  const api5 = await db.all(getMatchOfPlayer)
  response.send(api5)
})

//API6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getplayersOfMatch = `
      SELECT
      player_id AS playerId,
      player_name AS playerName
      FROM 
      player_details NATURAL JOIN player_match_score
      WHERE
      player_match_score.match_id=${matchId}
  `
  const api6 = await db.all(getplayersOfMatch)
  response.send(api6)
})

//API7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getTotal = `
    SELECT
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(player_match_score.fours) AS totalFours,
      SUM(player_match_score.sixes) AS totalSixes
    FROM 
      player_details INNER JOIN player_match_score ON
      player_details.player_id=player_match_score.player_id
    WHERE
      player_details.player_id=${playerId}
  `
  const api7 = await db.get(getTotal)
  response.send(api7)
})

module.exports = app
