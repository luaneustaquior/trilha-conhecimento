import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWebRouter } from './routes/web.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function createApp(db) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(ROOT_DIR, 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(ROOT_DIR, 'public')));
  app.use('/public', express.static(path.join(ROOT_DIR, 'public')));

  // Backward-compatible ?url= query dispatcher supporting nested subpaths
  app.use((req, res, next) => {
    if (req.query && typeof req.query.url === 'string' && req.query.url.trim() !== '') {
      const normalized = req.query.url.trim().replace(/^\/+/, '');
      if (normalized.includes('..')) {
        return res.status(400).render('errors/404', { pageTitle: 'Requisição inválida', baseUrl: '/', currentPath: '' });
      }
      req.url = '/' + normalized;
    }
    next();
  });

  // Shared layout template variables
  app.use((req, res, next) => {
    res.locals.baseUrl = '/';
    res.locals.currentPath = req.path === '/' ? '/entrada' : req.path;
    res.locals.pageTitle = 'Trilha do Conhecimento';
    next();
  });

  app.use('/', createWebRouter(db));

  // 404 Handler
  app.use((req, res) => {
    res.status(404).render('errors/404', {
      pageTitle: 'Página não encontrada'
    });
  });

  return app;
}
