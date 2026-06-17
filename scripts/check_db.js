
const https = require('https');

const SUPABASE_URL = 'https://snsyusgwbqwamkwoijeb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_laiHFnnD5NDCrAWPweRsSw_F2ARqa_n';

function fetchHabitaciones() {
    const options = {
        hostname: 'snsyusgwbqwamkwoijeb.supabase.co',
        path: '/rest/v1/habitaciones?select=*,estilos:habitacion_estilos(*)&status=eq.available',
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Status Code:', res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const json = JSON.parse(data);
                    console.log('Data count:', json.length);
                    if (json.length > 0) {
                        console.log('Sample Data:', JSON.stringify(json[0], null, 2));
                    } else {
                        console.log('Data is empty array []');
                    }
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                }
            } else {
                console.log('Error Body:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request error:', e);
    });

    req.end();
}

fetchHabitaciones();
