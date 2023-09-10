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
    const response = await axios.get(url, { timeout: 500 });
    if (response.status === 200) {
      const data = response.data;

      if (Array.isArray(data)) {
        result.push(...data.filter(Number.isInteger));
      } else if (typeof data === 'object') {
        for (const key in data) {
          if (Number.isInteger(data[key])) {
            result.push(data[key]);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
  }
}

app.listen(port, () => {
  console.log(`Number Management Service is running on port ${port}`);
});

