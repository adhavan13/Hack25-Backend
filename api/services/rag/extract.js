
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { fileURLToPath } from 'url';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default PDF path
const defaultPdfPath = path.join(__dirname, 'pdfs', 'e-application.portal-dashboard.pdf');

// Get PDF path from CLI args, fallback to default
const pdfPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPdfPath;

async function extract() {
    try {
        if (!fs.existsSync(pdfPath)) {
            console.error(`File not found: ${pdfPath}`);
            process.exit(1);
        }
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);

        const result = {
            filename: path.basename(pdfPath),
            text: data.text // all text in the PDF
        };

        fs.writeFileSync('singlePdf.json', JSON.stringify(result, null, 2));
        console.log('Extraction complete! JSON saved as singlePdf.json');
    } catch (err) {
        console.error('Error extracting PDF:', err);
        process.exit(1);
    }
}

extract();
