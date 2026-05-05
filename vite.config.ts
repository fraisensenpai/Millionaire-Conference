import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Custom Vite Plugin for local API to save files to disk
const localScoresApi = () => ({
  name: 'local-scores-api',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      // POST /api/scores
      if (req.url === '/api/scores' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const entry = JSON.parse(body);
            const scoresPath = path.resolve(__dirname, 'scores.json');
            let scores = [];
            if (fs.existsSync(scoresPath)) {
              scores = JSON.parse(fs.readFileSync(scoresPath, 'utf-8'));
            }
            if (entry.image) {
              const base64Data = entry.image.replace(/^data:image\/\w+;base64,/, "");
              // Yeni format: IsimSoyisim.jpg
              const cleanName = (entry.name + entry.surname).replace(/\s+/g, '');
              const filename = `${cleanName}.jpg`;
              const capturesDir = path.resolve(__dirname, 'public/captures');
              if (!fs.existsSync(capturesDir)) fs.mkdirSync(capturesDir, { recursive: true });
              const filePath = path.resolve(capturesDir, filename);
              fs.writeFileSync(filePath, base64Data, {encoding: 'base64'});
              entry.photo = `/captures/${filename}`;
              delete entry.image;
            }
            
            scores.push(entry);
            scores.sort((a: any, b: any) => b.prize - a.prize);
            scores = scores.slice(0, 10);
            fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(scores));
          } catch(e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({error: e.message}));
          }
        });
        return;
      }
      
      // GET /api/scores
      if (req.url === '/api/scores' && req.method === 'GET') {
        try {
          const scoresPath = path.resolve(__dirname, 'scores.json');
          let scores = [];
          if (fs.existsSync(scoresPath)) {
            scores = JSON.parse(fs.readFileSync(scoresPath, 'utf-8'));
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(scores));
        } catch(e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({error: e.message}));
        }
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), localScoresApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
