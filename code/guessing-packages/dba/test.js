const argon2 = require('argon2');

const test = async () => {
    const hash = await argon2.hash("hello");
    console.log(hash);
}

test();