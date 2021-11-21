import http from 'http';
import { ModifiedRequest } from '../type';

const rawBodySaver = (req: http.IncomingMessage, res: http.OutgoingMessage, buf: Buffer, encoding: string): void => {
  if (buf && buf.length) {
    const bufferEncoding = (encoding || 'utf8') as BufferEncoding;
    const rawBody = buf.toString(bufferEncoding);
    (req as ModifiedRequest).rawBody = rawBody;
  }
};

export default rawBodySaver;
