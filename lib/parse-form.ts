// lib/parse-form.ts
import formidable from 'formidable';
import type { IncomingMessage } from 'http';

export const parseForm = (req: IncomingMessage): Promise<{ fields: any; files: any }> => {
  const form = formidable({ multiples: true, keepExtensions: true, maxFileSize: 10 * 1024 * 1024 }); // 10MB
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};
