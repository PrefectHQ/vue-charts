// This is necessary until TypeScript 4.6 extends the crypto interface
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

export default {}