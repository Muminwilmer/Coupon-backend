const axios = require('axios');
const cheerio = require('cheerio');

async function fetchAndExtractID(domain, pageUrl, extraPage) {
  try {
    const response = await axios.get(`https://${domain}.se/${extraPage}${pageUrl}`)

    const match = response.data.match(/'([A-Z0-9-]{36})'/);
    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error('No ID was found??');
    }
  } catch (error) {
    // console.error('Error fetching ID:', error);
    console.log("Error!")
    console.log("domain", domain)
    console.log("pageUrl", pageUrl)
    console.log("extraPage", extraPage)
  }
}

async function followRedirects(id, domain) {
  try {
    let url = `https://${domain}.qualifioapp.com/20/${id}/v1.cfm?id=${id}&pdomain=https://${domain}.se`;

    // Just for the funnsies log the redirects
    // axios.interceptors.request.use(async (config) => {
    //   console.log(`Redirect: ${config.url}`);
    //   return config;
    // });

    const response = await axios.get(url, { maxRedirects: 5 });
    return response.request.res.responseUrl; // URL
  } catch (error) {
    // console.error('Error following redirects:', error);
    console.log("Error!")
    console.log("domain", domain)
    console.log("id", id)
  }
}

async function submitForm(finalUrl, formData) {
  try {
    const response = await axios.post(finalUrl, new URLSearchParams(formData).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('success!');
  } catch (error) {
    console.error('Error on form:', error);
  }
}

// Main function to automate the entire process
async function automizeProcess(formData, domain, pageUrl, extraPage) {
  try {
    // Step 1: Get them ids
    const id = await fetchAndExtractID(domain, pageUrl, extraPage);
    console.log('Played id:', id);

    // Step 2: Follow redirects
    const finalUrl = await followRedirects(id, domain);
    console.log('Final URL:', finalUrl);

    // Step 3: Get the $$$
    await submitForm(finalUrl, formData);
    console.log("Done!")
    return [id]
  } catch (error) {
    console.error('fail:', error);
  }
}

module.exports = automizeProcess;