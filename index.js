const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs')

// Middleware to parse JSON bodies from requests
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Route to handle POST requests to /qualifioapp/
app.post('/qualifioapp/', async (req, res) => {
  const reqData = req.body; // Extract the form data from the request body
  console.log(req.body)
  console.log('Content-Type:', req.headers['content-type']);

  const domain = req.body.domain;
  if (!domain) res.status(400).json({ message: "You need to add the domain"});
  const pageUrl = req.body.pageUrl
  if (!pageUrl) res.status(400).json({ message: "You need to add the pageUrl"});
  const formData = req.body.formData
  if (!formData) res.status(400).json({ message: "You need to add the formData"});


  try {
    const automizeProcess = require("./public/qualifioapp/index.js")
    const results = await automizeProcess(formData, domain, pageUrl)
    const [id] = results

    // Send success response
    res.status(200).json({ message: "Form submitted successfully", id });
  } catch (error) {
    console.error('Error in process:', error);
    res.status(500).json({ message: "Error in automation process", error });
  }
});

app.get('/404*', (req, res, next) => {
  fs.readdir(path.join(__dirname, 'public', '404'), (err, files) => {
    // Filter for .jpg or .png files (or whatever formats you have)
    const catImages = files.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png')
    );

    // Select a random cat image
    const randomIndex = Math.floor(Math.random() * catImages.length);
    const randomCatImage = catImages[randomIndex];
    console.log(randomCatImage)
    res.send(`
      <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>404 Not Found</title>
              <style>
                  body {
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                      margin: 0;
                      background-color: #000000;
                  }
                  img {
                      max-width: 100%;
                      max-height: 100%;
                  }
              </style>
          </head>
          <body>
              <img src="${randomCatImage}?${Math.floor(Math.random()*10000)}" alt="Random Cat Image" />
          </body>
      </html>
    `);
  });
});


app.get('*', (req, res, next) => {
  const folder = req.params['0'];
  console.log(folder)
  if (folder.includes("404"))return;
  // Construct the path to the requested folder's index.html
  const folderPath = path.join(__dirname, 'public', folder, 'index.html');
  console.log(folderPath)
  // Send the file if it exists, otherwise forward the request to 404 handler
  res.sendFile(folderPath, (err) => {
    if (err) {
      console.log('File not found, sending to 404');
      res.redirect(`/404/${folder.replace("/","")}`);
    }
  });
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
