const express = require('express')
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser');

const app = express();


app.use(express.json())
app.use(bodyParser.json());

PORT = 5000

const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from React development server
    methods: ['POST', 'GET'], // Allow only POST requests
    allowedHeaders: ['Content-Type'], // Allow only Content-Type header
  };

  
app.use(cors(corsOptions));
app.options('/checkDates', cors(corsOptions)); // Enable preflight request handling
app.options('/getEvents', cors(corsOptions)); // Enable preflight request handling
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

app.get('/getDate',cors(corsOptions) ,(req, res) => {
    const getStartDateQuery = "SELECT date FROM holidaytable WHERE name = 'START'";
    const getEndDateQuery = "SELECT date FROM holidaytable WHERE name = 'END'";

    db.query(getStartDateQuery, (error, startDateResults) => {
        if (error) {
            console.log("Error Fetching Start Date", error.stack);
            return res.status(500).json({ msg: "Error fetching start date" });
        } else {
            db.query(getEndDateQuery, (error, endDateResults) => {
                if (error) {
                    console.log("Error Fetching End Date", error.stack);
                    return res.status(500).json({ msg: "Error fetching end date" });
                } else {
                    res.json({
                        startDate: startDateResults[0]?.date,
                        endDate: endDateResults[0]?.date
                    });
                }
            });
        }
    });
});





app.post('/checkDates', cors(corsOptions),(req, res) => {
    const { dates } = req.body;
  
    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({ msg: 'Invalid dates array' });
    }
  
    const query = `
      SELECT date, name, type, holiday
      FROM holidaytable
      WHERE date IN (?)`
    ;
  
    db.query(query, [dates], (err, results) => {
      if (err) {
        console.error('Error fetching holidays and events:', err);
        return res.status(500).json({ error: 'Error fetching holidays and events' });
      }
  
      const holidays = [];
      const events = [];
      results.forEach(row => {
        if (row.holiday) {
          holidays.push(row.date.toISOString().split('T')[0]);
        } else {
          events.push({ date: row.date.toISOString().split('T')[0], name: row.name, type: row.type }); // Collect events
        }
      });
  
      // Filter out holidays from dates array
      const filteredDates = dates.filter(date => !holidays.includes(date));
  
      res.json({ workingDaysList: filteredDates, events});
    });
  });
