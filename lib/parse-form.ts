// lib/parse-form.ts
import { IncomingForm } from 'formidable';
import type { IncomingMessage } from 'http';

export const parseForm = (req: IncomingMessage): Promise<{ fields: any; files: any }> => {
  const form = new IncomingForm({ multiples: true, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

