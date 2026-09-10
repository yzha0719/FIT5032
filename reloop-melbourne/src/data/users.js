// src/data/users.js
// Seed accounts. Passwords are stored as PBKDF2 hashes with a random salt per
// user (see src/utils/passwords.js), never as plain text. The demo password is
// in the README so markers can log in.
export const users = [
  {
    id: 1,
    name: 'Priya Shah',
    email: 'priya@example.com',
    salt: '30511da6acefee50ec4d28e1c002f197',
    passwordHash: 'b3dacca1937f3888ed4eaf6d40e2e73bff3fa9ea9c34921540655075d5f5f8af',
    role: 'member',
  },
  {
    id: 2,
    name: 'Jack Thompson',
    email: 'jack@example.com',
    salt: '94d1f1acc5ecbf1ab7ef81e6ab1c9010',
    passwordHash: 'cb9c0e65913d67703e0a1e746b1ee35c3059fac00e0210fb1d345d443f6d419b',
    role: 'volunteer',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@example.com',
    salt: '32e80967e0f81e12b71627a4f1840e99',
    passwordHash: '5d6c00e69cebe038324f1d22a96298d373bef2d0b24aa4f52d833bd9cc50a0db',
    role: 'admin',
  },
]
