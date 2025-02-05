const express = require('express');
const puppeteer = require('puppeteer');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const FormData = require('form-data');
const cors = require('cors');
const bodyParser = require('body-parser');
 
const firebaseConfig = {
    apiKey: "AIzaSyDtgbKuAAPKtPeOz27vJcH0JqIPtbxH6G0",
    authDomain: "pennywise-50c4b.firebaseapp.com",
    databaseURL: "https://pennywise-50c4b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pennywise-50c4b",
    storageBucket: "pennywise-50c4b.appspot.com",
    messagingSenderId: "677718301346",
    appId: "1:677718301346:web:b44b38f03919122d0355fb",
    measurementId: "G-YS2SG2378P"
};

const appFirebase = initializeApp(firebaseConfig);
const database = getDatabase(appFirebase);

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(cors());
app.use(bodyParser.json());

// Маршрут для работы с QR-сценарием с сайта
app.post('/fetch-purchase-info', async (req, res) => {
    const qrCodeData = req.body.qrCodeData;

    if (!qrCodeData) {
        return res.status(400).send({ error: 'QR code data is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://opd.financnasprava.sk/#!/check');
        await page.type('#input-receipt-id', qrCodeData);
        await page.click('#search-button');

        await page.waitForSelector('.receipt-detail-body');
        const result = await page.$eval('.receipt-detail-body', el => el.innerText);

        const obchodneMenoMatch = result.match(/Obchodné meno\s*([^\n]+)/);
        const datumCasVyhotoveniaMatch = result.match(/Dátum a čas vyhotovenia:\s*([^\n]+)/);
        const celkovaSumaDokladuMatch = result.match(/Celková suma dokladu:\s*([^\n]+)/);

        const description = obchodneMenoMatch ? obchodneMenoMatch[1].trim() : null;
        let date = datumCasVyhotoveniaMatch ? datumCasVyhotoveniaMatch[1].trim() : null;
        if (date) {
            date = date.split(' ')[0].replace(/\./g, '-'); // Убираем время, оставляем дату и меняем формат
        }


        let cost = celkovaSumaDokladuMatch ? celkovaSumaDokladuMatch[1].trim() : null;
        if (cost) {
            cost = cost.replace('€', '').trim(); // Убираем символ евро
        }

        const purchaseId = Date.now().toString();
        const type = 'expense'


        const costInfoQr = {
            date: date,
            description: description,
            cost: cost,
            id: purchaseId,
            type: type,
        };

        await browser.close();

        res.json({ success: true, data: costInfoQr });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ success: false, message: 'Error fetching purchase info' });
    }
});

// Маршрут для обработки загрузки QR-кода
app.post('/upload', upload.single('qrImage'), async (req, res) => {
    if (!req.file) {
        console.log('No file received');
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;

    try {
        // Создаём объект FormData для отправки файла на API
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        // Отправляем запрос на API для декодирования QR-кода
        const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', formData, {
            headers: formData.getHeaders(),
        });

        // Удаляем временный файл после успешной обработки
        fs.unlinkSync(filePath);

        // Проверяем, что API вернул данные
        if (response.data && response.data[0] && response.data[0].symbol[0].data) {
            const qrCodeUpload = response.data[0].symbol[0].data;

            // Используем Puppeteer для обработки данных
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto('https://opd.financnasprava.sk/#!/check');
            await page.type('#input-receipt-id', qrCodeUpload);
            await page.click('#search-button');

            await page.waitForSelector('.receipt-detail-body');
            const result = await page.$eval('.receipt-detail-body', el => el.innerText);

            const obchodneMenoMatch = result.match(/Obchodné meno\s*([^\n]+)/);
            const datumCasVyhotoveniaMatch = result.match(/Dátum a čas vyhotovenia:\s*([^\n]+)/);
            const celkovaSumaDokladuMatch = result.match(/Celková suma dokladu:\s*([^\n]+)/);

            const description = obchodneMenoMatch ? obchodneMenoMatch[1].trim() : null;
            let date = datumCasVyhotoveniaMatch ? datumCasVyhotoveniaMatch[1].trim() : null;
            if (date) {
                date = date.split(' ')[0].replace(/\./g, '-'); // Убираем время, оставляем дату и меняем формат
            }
            let cost = celkovaSumaDokladuMatch ? celkovaSumaDokladuMatch[1].trim() : null;
            if (cost) {
                cost = cost.replace('€', '').trim(); // Убираем символ евро
            }

            const purchaseId = Date.now().toString();
            const type = 'expense'


            const costInfoQr = {
                date: date,
                description: description,
                cost: cost,
                id: purchaseId,
                type: type,
            };

            await browser.close();

            // Возвращаем данные клиенту
            return res.json({ success: true, data: costInfoQr });
        } else {
            console.log('No decoded text found in API response');
            return res.status(400).json({ success: false, message: 'No QR code found' });
        }
    } catch (error) {
        console.error('Error processing QR code:', error.message);

        // Удаляем временный файл при ошибке
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).send('Error processing QR code');
    }
});

// Proxy endpoints for Python NumPy-based financial analytics service
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Proxy endpoint for financial statistics
app.post('/api/financial/statistics', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/api/financial/statistics`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ error: 'Error calculating statistics' });
    }
});

// Proxy endpoint for trend analysis
app.post('/api/financial/trends', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/api/financial/trends`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ error: 'Error calculating trends' });
    }
});

// Proxy endpoint for risk metrics
app.post('/api/financial/risk-metrics', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/api/financial/risk-metrics`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ error: 'Error calculating risk metrics' });
    }
});

// Proxy endpoint for budget forecasting
app.post('/api/financial/forecast', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/api/financial/forecast`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ error: 'Error generating forecast' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Python service URL: ${PYTHON_SERVICE_URL}`);
});
