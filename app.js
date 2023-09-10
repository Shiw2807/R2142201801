const express = require('express');
const axios = require('axios');
const { uniq, sortBy } = require('lodash');

const app = express();
const port = 8008;

app.use(express.json());

app.get('/numbers', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const result = [];

  try {
    if (typeof url === 'string') {
      await processResponse(url, result);
    } else if (Array.isArray(url)) {
      const promises = url.map((u) => processResponse(u, result));
      await Promise.all(promises);
    }

    const uniqueSortedNumbers = sortBy(uniq(result));
    res.json({ numbers: uniqueSortedNumbers });
  } catch (error) {
    console.error('Error processing URLs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function processResponse(url, result) {   
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log(response.data.numbers);
    const uniqueNUms = new Set(response.data.numbers);
    uniqueNUms.forEach(number=>{
      result.push(number);
    })
    console.log(result);
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
  }
}

app.listen(port, () => {
  console.log(`Number Management Service is running on port ${port}`);
});

