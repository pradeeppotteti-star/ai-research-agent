import serverless from 'serverless-http';
import app from '../../backend/src/server';

export const handler = serverless(app, {
  binary: ['application/zip', 'application/pdf', 'application/octet-stream'],
});
